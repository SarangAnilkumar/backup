import json
import os
import pymysql

# ---------- RDS config (consistent with other lambdas) ----------
RDS_HOST = os.environ.get('RDS_HOST')
RDS_PORT = int(os.environ.get('RDS_PORT', 3306))
RDS_USER = os.environ.get('RDS_USER')
RDS_PASSWORD = os.environ.get('RDS_PASSWORD')
RDS_DB = os.environ.get('RDS_DB')


# ---------- Helpers ----------
def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,x-api-key",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }


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


def pick_sex_name(input_sex: str) -> str:
    s = (input_sex or "").strip().lower()
    if s in ("male", "m", "man", "boy", "men"):
        return "Males"
    if s in ("female", "f", "woman", "girl", "women"):
        return "Females"
    return "Persons"


def get_age_group_id(cur, age_group_label=None, min_age=None, max_age=None):
    if age_group_label:
        cur.execute(
            "SELECT age_group_id FROM dim_age_group WHERE age_group_label=%s LIMIT 1",
            (age_group_label,)
        )
        row = cur.fetchone()
        if row:
            return int(row["age_group_id"])
    if min_age is not None and max_age is not None:
        cur.execute(
            "SELECT age_group_id FROM dim_age_group WHERE min_age=%s AND max_age=%s LIMIT 1",
            (int(min_age), int(max_age))
        )
        row = cur.fetchone()
        if row:
            return int(row["age_group_id"])
    # default to 25–34 cohort if not found
    cur.execute(
        "SELECT age_group_id FROM dim_age_group WHERE min_age=25 AND max_age=34 LIMIT 1"
    )
    row = cur.fetchone()
    return int(row["age_group_id"]) if row else None


def fetch_at_risk_baseline(cur, sex_name: str, age_group_id_25_34: int):
    """Return baseline at-risk percentages used for simple what-if scaling.
    Keys: alcohol_exceeded, smoker_daily, inactive_not_met, overweight_or_obese_25_34
    """
    result = {
        "alcohol_exceeded": None,
        "smoker_daily": None,
        "inactive_not_met": None,
        "overweight_or_obese_25_34": None,
    }

    # Alcohol: Exceeded guideline (Persons, All 18+, AUS)
    cur.execute(
        """
        SELECT MAX(f.value) AS v
        FROM fact_health_indicator f
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Alcohol consumption'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name LIKE 'Exceeded guideline%'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type='AUS' AND dl.abs_code='AUS'
        """
    )
    row = cur.fetchone()
    result["alcohol_exceeded"] = float(row["v"]) if row and row["v"] is not None else None

    # Smoking: Current daily smoker (Persons, All 18+, AUS)
    cur.execute(
        """
        SELECT MAX(f.value) AS v
        FROM fact_health_indicator f
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Smoker status'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Current daily smoker'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type='AUS' AND dl.abs_code='AUS'
        """
    )
    row = cur.fetchone()
    result["smoker_daily"] = float(row["v"]) if row and row["v"] is not None else None

    # Physical inactivity: Did not meet guideline% (Persons, All 18+, AUS)
    cur.execute(
        """
        SELECT MAX(f.value) AS v
        FROM fact_health_indicator f
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Physical activity (2014 guidelines)'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name LIKE 'Did not meet guideline%'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type='AUS' AND dl.abs_code='AUS'
        """
    )
    row = cur.fetchone()
    result["inactive_not_met"] = float(row["v"]) if row and row["v"] is not None else None

    # BMI Overweight or Obese for 25–34, Persons, AUS
    cur.execute(
        """
        SELECT MAX(f.value) AS v
        FROM fact_health_indicator f
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Body Mass Index (BMI)'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Overweight or Obese'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type='AUS'
        WHERE f.age_group_id=%s
        """,
        (age_group_id_25_34,)
    )
    row = cur.fetchone()
    result["overweight_or_obese_25_34"] = float(row["v"]) if row and row["v"] is not None else None

    return result


def fetch_alcohol_exceeded_series(cur, region_type: str = 'AUS', abs_code: str = 'AUS'):
    """AUS Alcohol exceeded guideline (%), Persons, All 18+.
    Returns rows: survey_period, category_name, value
    Tip: region_type/abs_code can be swapped for state (e.g., STATE/VIC).
    """
    cur.execute(
        """
        SELECT f.survey_period, c.category_name, f.value
        FROM fact_health_indicator f
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Alcohol consumption'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name LIKE %s
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        ORDER BY f.survey_period
        """,
        ('Exceeded guideline%', region_type, abs_code)
    )
    return cur.fetchall()


def fetch_smoker_daily_series(cur, region_type: str = 'AUS', abs_code: str = 'AUS'):
    """AUS Current daily smoker (%), Persons, All 18+.
    Returns rows: survey_period, value
    """
    cur.execute(
        """
        SELECT f.survey_period, f.value
        FROM fact_health_indicator f
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Smoker status'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Current daily smoker'
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        ORDER BY f.survey_period
        """,
        (region_type, abs_code)
    )
    return cur.fetchall()


def fetch_physical_activity_latest(cur, region_type: str = 'AUS', abs_code: str = 'AUS'):
    """AUS Physical activity (2014 guidelines), Persons, All 18+ (met and not met).
    Returns rows for the latest survey period only: category_name, value
    """
    # find latest survey period for these constraints
    cur.execute(
        """
        SELECT MAX(f.survey_period) AS latest_period
        FROM fact_health_indicator f
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Physical activity (2014 guidelines)'
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        """,
        (region_type, abs_code)
    )
    row = cur.fetchone()
    latest = row.get('latest_period') if row else None

    # fall back to all if latest is None
    if latest:
        cur.execute(
            """
            SELECT c.category_name, f.value
            FROM fact_health_indicator f
            JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Physical activity (2014 guidelines)'
            JOIN dim_category c ON c.category_id=f.category_id AND c.category_name IN ('Met guidelines','Did not meet guideline')
            JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
            JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
            JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            WHERE f.survey_period=%s
            ORDER BY c.category_name
            """,
            (region_type, abs_code, latest)
        )
    else:
        cur.execute(
            """
            SELECT c.category_name, f.value
            FROM fact_health_indicator f
            JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Physical activity (2014 guidelines)'
            JOIN dim_category c ON c.category_id=f.category_id AND c.category_name IN ('Met guidelines','Did not meet guideline')
            JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
            JOIN dim_age_group ag ON ag.age_group_id=f.age_group_id AND ag.age_group_label='All 18+'
            JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            ORDER BY c.category_name
            """,
            (region_type, abs_code)
        )
    return cur.fetchall()


def fetch_bmi_overweight_obese_25_34(cur, region_type: str = 'AUS', abs_code: str = 'AUS'):
    """AUS BMI, Persons, 25–34 (% Overweight or Obese) – single value for latest period.
    """
    # resolve age group id 25–34 and latest survey_period for BMI
    cur.execute("SELECT age_group_id FROM dim_age_group WHERE min_age=25 AND max_age=34 LIMIT 1")
    row = cur.fetchone()
    if not row:
        return None
    age_group_id = int(row['age_group_id'])

    cur.execute(
        """
        SELECT MAX(f.survey_period) AS latest_period
        FROM fact_health_indicator f
        JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Body Mass Index (BMI)'
        JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Overweight or Obese'
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
        JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        WHERE f.age_group_id=%s
        """,
        (region_type, abs_code, age_group_id)
    )
    r = cur.fetchone()
    latest = r.get('latest_period') if r else None

    if latest:
        cur.execute(
            """
            SELECT f.value
            FROM fact_health_indicator f
            JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Body Mass Index (BMI)'
            JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Overweight or Obese'
            JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
            JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            WHERE f.age_group_id=%s AND f.survey_period=%s
            LIMIT 1
            """,
            (region_type, abs_code, age_group_id, latest)
        )
    else:
        cur.execute(
            """
            SELECT MAX(f.value) AS value
            FROM fact_health_indicator f
            JOIN dim_health_indicator hi ON hi.indicator_id=f.indicator_id AND hi.indicator_name='Body Mass Index (BMI)'
            JOIN dim_category c ON c.category_id=f.category_id AND c.category_name='Overweight or Obese'
            JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name='Persons'
            JOIN dim_location dl ON dl.location_id=f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            WHERE f.age_group_id=%s
            """,
            (region_type, abs_code, age_group_id)
        )
    row2 = cur.fetchone()
    return float(row2['value']) if row2 and row2.get('value') is not None else None


def fetch_top_burden(cur, risk_factor_name: str, sex_name: str, age_group_id: int, data_year: int, limit: int):
    cur.execute(
        """
        SELECT d.disease_name,
               f.data_year,
               f.attributable_daly
        FROM fact_risk_burden_unadj f
        JOIN dim_risk_factor rf ON rf.risk_factor_id=f.risk_factor_id AND rf.risk_factor_name=%s
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name=%s
        JOIN dim_disease d ON d.disease_id=f.disease_id
        WHERE f.age_group_id=%s
          AND f.data_year=%s
        ORDER BY f.attributable_daly DESC
        LIMIT %s
        """,
        (risk_factor_name, sex_name, int(age_group_id), int(data_year), int(limit))
    )
    return cur.fetchall()


def fetch_top_risk_factors(cur, sex_name: str, age_group_id: int, data_year: int, limit: int = 10):
    """Top risk factors by attributable DALY for a cohort.
    Matches: Baseline: Cohort Risk Profile section.
    """
    cur.execute(
        """
        SELECT rf.risk_factor_name,
               ROUND(SUM(f.attributable_daly), 0) AS attrib_daly
        FROM fact_risk_burden_unadj f
        JOIN dim_risk_factor rf ON rf.risk_factor_id=f.risk_factor_id
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name=%s
        WHERE f.age_group_id=%s AND f.data_year=%s
        GROUP BY rf.risk_factor_name
        ORDER BY attrib_daly DESC
        LIMIT %s
        """,
        (sex_name, int(age_group_id), int(data_year), int(limit))
    )
    return cur.fetchall()


def fetch_all_ages_variant(cur, risk_factor_name: str, sex_name: str, data_year: int, limit: int = 10):
    """Top diseases by risk factor (all ages combined)."""
    cur.execute(
        """
        SELECT d.disease_name,
               ROUND(f.attributable_daly,0) AS attrib_daly
        FROM fact_risk_burden_allages f
        JOIN dim_risk_factor rf ON rf.risk_factor_id=f.risk_factor_id AND rf.risk_factor_name=%s
        JOIN dim_sex sx ON sx.sex_id=f.sex_id AND sx.sex_name=%s
        JOIN dim_disease d ON d.disease_id=f.disease_id
        WHERE f.data_year=%s
        ORDER BY f.attributable_daly DESC
        LIMIT %s
        """,
        (risk_factor_name, sex_name, int(data_year), int(limit))
    )
    return cur.fetchall()


def apply_simple_scaling(rows, baseline_pct: float, delta_points: float):
    if baseline_pct is None or baseline_pct <= 0 or delta_points is None:
        # no change -> projected equals current
        return [
            {
                "disease_name": r["disease_name"],
                "data_year": int(r["data_year"]),
                "current_attrib_daly": float(r["attributable_daly"]) if r["attributable_daly"] is not None else None,
                "projected_attrib_daly": float(r["attributable_daly"]) if r["attributable_daly"] is not None else None,
                "delta_daly": 0.0
            }
            for r in rows
        ]

    scale = max(0.0, (baseline_pct - float(delta_points)) / baseline_pct)
    out = []
    for r in rows:
        cur_val = float(r["attributable_daly"]) if r["attributable_daly"] is not None else 0.0
        proj = cur_val * scale
        out.append({
            "disease_name": r["disease_name"],
            "data_year": int(r["data_year"]),
            "current_attrib_daly": cur_val,
            "projected_attrib_daly": round(proj, 0),
            "delta_daly": round(max(0.0, cur_val - proj), 0)
        })
    return out


# ---------- New: Biomarker/Lifestyle Distributions ----------
def fetch_egfr_distribution(cur, survey_period: str = '2022–24', region_type: str = 'AUS', abs_code: str = 'AUS'):
    """Kidney function distribution (eGFR) by sex for a survey period.
    Returns: sex, egfr_category, percentage
    """
    cur.execute(
        """
        SELECT ds.sex_name        AS sex,
               dc.category_name   AS egfr_category,
               f.value            AS percentage
        FROM fact_health_indicator f
        JOIN dim_health_indicator di ON f.indicator_id = di.indicator_id
        JOIN dim_category dc         ON f.category_id  = dc.category_id
        JOIN dim_sex ds              ON f.sex_id       = ds.sex_id
        JOIN dim_location dl         ON dl.location_id = f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        WHERE di.indicator_name = 'eGFR (mL/min/1.73m²) range'
          AND f.survey_period   = %s
        ORDER BY ds.sex_name, dc.category_name
        """,
        (region_type, abs_code, survey_period)
    )
    return cur.fetchall()


def fetch_bmi_distribution(cur, age_group_label: str = '25–34', region_type: str = 'AUS', abs_code: str = 'AUS'):
    """BMI distribution by category for a given age group and sex.
    Uses 'Measured Body Mass Index(f)' to reflect measured BMI categories.
    Returns: sex, age_group, bmi_category, percentage
    """
    cur.execute(
        """
        SELECT DISTINCT ds.sex_name            AS sex,
               da.age_group_label     AS age_group,
               dc.category_name       AS bmi_category,
               f.value                AS percentage
        FROM fact_health_indicator f
        JOIN dim_health_indicator di ON f.indicator_id = di.indicator_id
        JOIN dim_category dc         ON f.category_id  = dc.category_id
        JOIN dim_sex ds              ON f.sex_id       = ds.sex_id
        JOIN dim_age_group da        ON f.age_group_id = da.age_group_id
        JOIN dim_location dl         ON dl.location_id = f.location_id AND dl.region_type=%s AND dl.abs_code=%s
        WHERE di.indicator_name = 'Measured Body Mass Index(f)'
          AND da.age_group_label = %s
        ORDER BY ds.sex_name, dc.category_name
        """,
        (region_type, abs_code, age_group_label)
    )
    return cur.fetchall()


def fetch_fruit_consumption_distribution(cur, region_type: str = 'AUS', abs_code: str = 'AUS', age_group_label: str = None):
    """Fruit consumption distribution by sex and age group.
    Indicator: 'Daily consumption of fruit(c)'
    If age_group_label is provided, filters to that group.
    Returns: sex, age_group, consumption_category, percentage
    """
    if age_group_label:
        cur.execute(
            """
            SELECT DISTINCT ds.sex_name        AS sex,
                   da.age_group_label AS age_group,
                   dc.category_name   AS consumption_category,
                   f.value            AS percentage
            FROM fact_health_indicator f
            JOIN dim_health_indicator di ON f.indicator_id = di.indicator_id
            JOIN dim_category dc         ON f.category_id  = dc.category_id
            JOIN dim_sex ds              ON f.sex_id       = ds.sex_id
            JOIN dim_age_group da        ON f.age_group_id = da.age_group_id
            JOIN dim_location dl         ON dl.location_id = f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            WHERE di.indicator_name = 'Daily consumption of fruit(c)'
              AND da.age_group_label = %s
            ORDER BY ds.sex_name, da.age_group_label, dc.category_name
            """,
            (region_type, abs_code, age_group_label)
        )
    else:
        cur.execute(
            """
            SELECT DISTINCT ds.sex_name        AS sex,
                   da.age_group_label AS age_group,
                   dc.category_name   AS consumption_category,
                   f.value            AS percentage
            FROM fact_health_indicator f
            JOIN dim_health_indicator di ON f.indicator_id = di.indicator_id
            JOIN dim_category dc         ON f.category_id  = dc.category_id
            JOIN dim_sex ds              ON f.sex_id       = ds.sex_id
            JOIN dim_age_group da        ON f.age_group_id = da.age_group_id
            JOIN dim_location dl         ON dl.location_id = f.location_id AND dl.region_type=%s AND dl.abs_code=%s
            WHERE di.indicator_name = 'Daily consumption of fruit(c)'
            ORDER BY ds.sex_name, da.age_group_label, dc.category_name
            """,
            (region_type, abs_code)
        )
    return cur.fetchall()


# ---------- New: Risk-factor burden (template) ----------
def fetch_risk_factor_burden(cur, risk_factor_name: str, age_group_label: str, sex_name: str = 'Persons', data_year: int = 2018, limit: int = 50):
    """Risk-factor disease burden with attributable share.
    Returns: disease_name, attributable_daly, daly, attributable_percent
    Note: Availability of data_year and risk_factor_name depends on dataset; may return empty.
    """
    cur.execute(
        """
        SELECT d.disease_name,
               frbua.attributable_daly,
               frbua.daly,
               (frbua.attributable_daly / NULLIF(frbua.daly,0)) * 100 AS attributable_percent
        FROM fact_risk_burden_unadj frbua
        JOIN dim_risk_factor rf ON frbua.risk_factor_id = rf.risk_factor_id
        JOIN dim_age_group ag  ON frbua.age_group_id = ag.age_group_id
        JOIN dim_sex ds        ON frbua.sex_id       = ds.sex_id
        JOIN dim_disease d     ON frbua.disease_id   = d.disease_id
        WHERE rf.risk_factor_name = %s
          AND ag.age_group_label   = %s
          AND ds.sex_name          = %s
          AND frbua.data_year      = %s
        ORDER BY attributable_percent DESC
        LIMIT %s
        """,
        (risk_factor_name, age_group_label, sex_name, int(data_year), int(limit))
    )
    return cur.fetchall()


# ---------- Lambda ----------
def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    try:
        body = event.get("body")
        payload = json.loads(body or "{}") if isinstance(body, str) else (body or {})

        # Inputs
        sex_in = payload.get("sex") or payload.get("gender") or "Persons"
        sex_name = pick_sex_name(sex_in)
        data_year = int(payload.get("data_year", 2018))
        age_group_label = payload.get("age_group_label")
        min_age = payload.get("min_age")
        max_age = payload.get("max_age")
        top_n = int(payload.get("top_n", 10))

        # Location controls for indicator queries (default AUS national)
        region_type = payload.get("region_type", "AUS")
        abs_code = payload.get("abs_code", "AUS")

        # Deltas (percentage points to reduce at-risk share)
        deltas = payload.get("deltas", {}) or {}
        alcohol_delta = deltas.get("alcohol_exceeded_delta")  # e.g., 5 means reduce by 5 points
        smoker_delta = deltas.get("smoker_daily_delta")
        inactive_delta = deltas.get("inactive_not_met_delta")
        overweight_delta = deltas.get("overweight_or_obese_delta")

        # Connect
        conn = connect()
        with conn.cursor() as cur:
            # Resolve age group for cohort queries
            age_group_id = get_age_group_id(cur, age_group_label, min_age, max_age)
            # Resolve 25–34 id for BMI at-risk baseline
            age_25_34_id = get_age_group_id(cur, None, 25, 34)

            # Fetch baselines
            baselines = fetch_at_risk_baseline(cur, sex_name, age_25_34_id)

            # Fetch top burden rows per risk factor
            results = {}
            # Alcohol
            rows = fetch_top_burden(cur, 'Alcohol use', sex_name, age_group_id, data_year, top_n)
            results['alcohol_use'] = apply_simple_scaling(rows, baselines['alcohol_exceeded'], alcohol_delta)
            # Tobacco
            rows = fetch_top_burden(cur, 'Tobacco use', sex_name, age_group_id, data_year, top_n)
            results['tobacco_use'] = apply_simple_scaling(rows, baselines['smoker_daily'], smoker_delta)
            # Physical inactivity
            rows = fetch_top_burden(cur, 'Physical inactivity', sex_name, age_group_id, data_year, top_n)
            results['physical_inactivity'] = apply_simple_scaling(rows, baselines['inactive_not_met'], inactive_delta)
            # Overweight/obesity
            rows = fetch_top_burden(cur, 'Overweight (including obesity)', sex_name, age_group_id, data_year, top_n)
            # Use 25–34 baseline for simplicity; can be extended to age-specific baselines
            results['overweight_obesity'] = apply_simple_scaling(rows, baselines['overweight_or_obese_25_34'], overweight_delta)

            # Indicator query outputs (AUS by default, swappable)
            indicators = {
                "alcohol_exceeded_series": fetch_alcohol_exceeded_series(cur, region_type, abs_code),
                "smoker_daily_series": fetch_smoker_daily_series(cur, region_type, abs_code),
                "physical_activity_latest": fetch_physical_activity_latest(cur, region_type, abs_code),
                "bmi_overweight_or_obese_25_34": fetch_bmi_overweight_obese_25_34(cur, region_type, abs_code),
            }

            # Cohort risk profile (top risk factors for the cohort)
            cohort_risk_profile = fetch_top_risk_factors(cur, sex_name, age_group_id, data_year, top_n)

            # All-ages variant (optional risk factor name)
            all_ages_risk_factor = payload.get("all_ages_risk_factor", None)
            all_ages_variant = None
            if all_ages_risk_factor:
                all_ages_variant = fetch_all_ages_variant(cur, all_ages_risk_factor, sex_name, data_year, top_n)

            # New distributions and risk-factor burden
            egfr_survey_period = payload.get("egfr_survey_period", '2022–24')
            bmi_dist_age_group = payload.get("bmi_dist_age_group_label", '25–34')
            fruit_age_group = payload.get("fruit_age_group_label")  # optional

            distributions = {
                "egfr_distribution": fetch_egfr_distribution(cur, egfr_survey_period, region_type, abs_code),
                "bmi_distribution": fetch_bmi_distribution(cur, bmi_dist_age_group, region_type, abs_code),
                "fruit_consumption_distribution": fetch_fruit_consumption_distribution(cur, region_type, abs_code, fruit_age_group),
            }

            rf_query = payload.get("risk_factor_burden_query") or {}
            risk_factor_burden = None
            if rf_query.get("risk_factor_name") and rf_query.get("age_group_label"):
                rf_name = rf_query.get("risk_factor_name")
                rf_age_label = rf_query.get("age_group_label")
                rf_sex = pick_sex_name(rf_query.get("sex") or "Persons")
                rf_year = int(rf_query.get("data_year", data_year))
                rf_limit = int(rf_query.get("limit", 50))
                risk_factor_burden = fetch_risk_factor_burden(cur, rf_name, rf_age_label, rf_sex, rf_year, rf_limit)

        response = {
            "input": {
                "sex": sex_name,
                "data_year": data_year,
                "age_group_id": age_group_id,
                "age_group_label": age_group_label,
                "min_age": min_age,
                "max_age": max_age,
                "top_n": top_n,
                "region_type": region_type,
                "abs_code": abs_code,
                "deltas": deltas,
                "all_ages_risk_factor": payload.get("all_ages_risk_factor")
            },
            "baseline_at_risk_pct": baselines,
            "results": results,
            "indicators": indicators,
            "distributions": distributions,
            "risk_factor_burden": risk_factor_burden,
            "cohort_risk_profile": cohort_risk_profile,
            "all_ages_variant": all_ages_variant,
            "notes": [
                "Projected values use linear scaling by change in at-risk share.",
                "Baselines are national (AUS). BMI baseline uses 25–34 Persons.",
                "If a baseline is missing, current values are returned.",
                "Indicator queries can be swapped to a state via region_type/abs_code.",
                "Distribution queries added: eGFR (kidney), BMI, fruit consumption.",
                "Risk-factor disease burden template added (attributable %)."
            ]
        }

        return {"statusCode": 200, "headers": cors_headers(), "body": json.dumps(response, default=float)}

    except Exception as e:
        return {"statusCode": 500, "headers": cors_headers(), "body": json.dumps({"error": str(e)})}
