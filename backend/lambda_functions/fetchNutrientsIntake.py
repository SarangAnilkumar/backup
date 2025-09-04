import json
import os
import pymysql
from decimal import Decimal, ROUND_HALF_UP

# ---------- RDS config ----------
RDS_HOST = os.environ['RDS_HOST']
RDS_PORT = int(os.environ.get('RDS_PORT', 3306))
RDS_USER = os.environ['RDS_USER']
RDS_PASSWORD = os.environ['RDS_PASSWORD']
RDS_DB = os.environ['RDS_DB']

# ---------- Helpers ----------
def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,x-api-key",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

DEFAULT_UNIT_TO_GRAMS = {
    "g": 1.0, "gram": 1.0, "grams": 1.0,
    "kg": 1000.0, "kilogram": 1000.0, "kilograms": 1000.0,
    "ml": 1.0,
    "cup": 250.0, "cups": 250.0,
    "bowl": 300.0, "bowls": 300.0,
    "tbsp": 15.0, "tablespoon": 15.0,
    "tsp": 5.0, "teaspoon": 5.0,
    "piece": 50.0, "pieces": 50.0
}

def to_grams(quantity, unit, overrides=None, food_specific_weight=None):
    if overrides is None:
        overrides = {}
    unit_l = (unit or "").strip().lower()
    if food_specific_weight is not None:
        return float(quantity) * float(food_specific_weight), "food_specific"
    if unit_l in overrides:
        return float(quantity) * float(overrides[unit_l]), "override"
    if unit_l in DEFAULT_UNIT_TO_GRAMS:
        return float(quantity) * DEFAULT_UNIT_TO_GRAMS[unit_l], "default_fallback"
    return float(quantity), "assumed_grams"

def round4(x):
    return float(Decimal(x).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP))

def pick_filter_sex(input_sex: str):
    s = (input_sex or "").strip().lower()
    if s in ("male", "m", "man", "boy", "men"):
        return "Male"
    if s in ("female", "f", "woman", "girl", "women"):
        return "Female"
    return "Persons"

def connect():
    return pymysql.connect(
        host=RDS_HOST,
        port=RDS_PORT,
        user=RDS_USER,
        password=RDS_PASSWORD,
        db=RDS_DB,
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )

# ---------- Core queries ----------
GET_RECS_SQL = """
SELECT
  nd.nutrient_id,
  nd.nutrient_name,
  nd.unit AS nutrient_unit,
  nd.category,
  nr.recommended_amount,
  nr.unit AS rec_unit
FROM age_sex_filter f
JOIN NutrientRecommendation nr ON nr.filter_id = f.filter_id
JOIN NutrientDimension nd ON nd.nutrient_id = nr.nutrient_id
WHERE f.filter_sex = %s
  AND %s BETWEEN f.filter_age_start AND COALESCE(f.filter_age_end, 999)
"""

def make_food_query(keys_count:int):
    if keys_count == 0:
        raise ValueError("No public_food_key provided")
    return f"""
        SELECT public_food_key, food_name, nutrient_id, amount_per_100g
        FROM FoodNutrient
        WHERE public_food_key IN ({','.join(['%s']*keys_count)})
    """

# ---------- Lambda ----------
def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    try:
        body = event.get("body")
        payload = json.loads(body or "{}") if isinstance(body, str) else body or {}

        sex_in = payload.get("sex")
        age_in = payload.get("age")
        meals = payload.get("meals", {})
        unit_overrides = payload.get("unit_overrides", {}) or {}

        if not isinstance(age_in, (int, float)):
            raise ValueError("Missing or invalid 'age'")
        if not sex_in:
            raise ValueError("Missing 'sex'")
        if not isinstance(meals, dict) or not meals:
            raise ValueError("Missing 'meals' object with at least one meal")

        filter_sex = pick_filter_sex(sex_in)

        # Flatten all food items
        items, public_keys = [], []
        for meal_name, food_list in meals.items():
            for item in food_list:
                qty = item.get("quantity")
                unit = item.get("unit", "g")
                food_specific_weight = item.get("grams_per_unit")
                if "public_food_key" in item:
                    items.append((meal_name, item["public_food_key"], qty, unit, food_specific_weight))
                    public_keys.append(item["public_food_key"])
                else:
                    raise ValueError("All items must include 'public_food_key' for Option B")

        # DB fetch
        conn = connect()
        with conn.cursor() as cur:
            # Recommendations
            cur.execute(GET_RECS_SQL, (filter_sex, int(age_in)))
            rec_rows = cur.fetchall()
            rec_by_nutrient = {
                r["nutrient_id"]: {
                    "nutrient_name": r["nutrient_name"],
                    "category": r["category"],
                    "recommended_amount": float(r["recommended_amount"]),
                    "rec_unit": r["rec_unit"] or r["nutrient_unit"],
                    "nutrient_unit": r["nutrient_unit"]
                } for r in rec_rows
            }

            # Food nutrients
            sql = make_food_query(len(public_keys))
            cur.execute(sql, public_keys)
            food_rows = cur.fetchall()

        # Build food index (keyed only by public_food_key)
        food_index = {}
        for fr in food_rows:
            food_index.setdefault(fr["public_food_key"], []).append(fr)

        # Compute intakes
        per_meal, totals = {}, {}
        for meal_name, key, qty, unit, food_specific_weight in items:
            grams, grams_method = to_grams(qty, unit, unit_overrides, food_specific_weight)
            nutrient_list = food_index.get(key, [])
            if not nutrient_list:
                continue
            item_contrib = {}
            for row in nutrient_list:
                nid = row["nutrient_id"]
                per100 = float(row["amount_per_100g"])
                intake_amt = grams * per100 / 100.0
                item_contrib[nid] = item_contrib.get(nid, 0.0) + intake_amt
                totals[nid] = totals.get(nid, 0.0) + intake_amt
            per_meal.setdefault(meal_name, {"items": []})
            per_meal[meal_name]["items"].append({
                "identifier": key,
                "quantity": qty,
                "unit": unit,
                "grams_assumed": round4(grams),
                "grams_method": grams_method,
                "nutrients": {str(nid): round4(val) for nid, val in item_contrib.items()}
            })

        # Final report
        results = []
        all_nutrients = set(totals.keys()) | set(rec_by_nutrient.keys())
        for nid in sorted(all_nutrients):
            intake_total = totals.get(nid, 0.0)
            rec = rec_by_nutrient.get(nid)
            meal_breakdown = []
            if rec:
                recommended = rec["recommended_amount"]
                for meal_name, meal_data in per_meal.items():
                    meal_intake = sum(item["nutrients"].get(str(nid), 0.0) for item in meal_data["items"])
                    if meal_intake > 0:
                        meal_breakdown.append({
                            "meal": meal_name,
                            "intake_amount": round4(meal_intake),
                            "percent_of_recommendation": round4(meal_intake / recommended * 100) if recommended > 0 else None,
                            "percent_of_total": round4(meal_intake / intake_total * 100) if intake_total > 0 else None
                        })
                pct_total = (intake_total / recommended * 100.0) if recommended > 0 else None
                status = "adequate"
                if pct_total is not None:
                    if pct_total < 90: status = "deficient"
                    elif pct_total > 110: status = "excessive"
                results.append({
                    "nutrient_id": nid,
                    "nutrient_name": rec["nutrient_name"],
                    "category": rec["category"],
                    "unit": rec["nutrient_unit"],
                    "intake_amount": round4(intake_total),
                    "recommended_amount": round4(recommended),
                    "percent_of_recommendation": round4(pct_total) if pct_total else None,
                    "status": status,
                    "meal_contributions": meal_breakdown
                })
            else:
                results.append({
                    "nutrient_id": nid,
                    "nutrient_name": None,
                    "intake_amount": round4(intake_total),
                    "status": "no_recommendation"
                })

        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({
                "input": {"sex": sex_in, "age": age_in},
                "filter_sex_used": filter_sex,
                "per_meal": per_meal,
                "totals": results
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": str(e)})
        }
