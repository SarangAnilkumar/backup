import pandas as pd
import math
csv_files = {
    "nutrient_dimension.csv": "NutrientDimension",
    "food_nutrients_long.csv": "FoodNutrient",
    "nutrition_recommendations_refined.csv": "NutrientRecommendation"
}

allowed_columns = {
    "NutrientDimension": ["nutrient_id", "nutrient_name", "unit", "category"],
    "FoodNutrient": ["public_food_key", "nutrient_id", "amount_per_100g"],
    "NutrientRecommendation": ["nutrient_id", "sex", "age_start", "age_end", "recommended_amount", "unit","filter_id"]
}


output_file = "insert_data.sql"


def csv_to_sql(csv_path, table_name):
    df = pd.read_csv(csv_path)

    
    if table_name in allowed_columns:
        keep_cols = [c for c in df.columns if c in allowed_columns[table_name]]
        df = df[keep_cols]

    sql_statements = []
    for _, row in df.iterrows():
        values = []
        for v in row:
            if pd.isna(v) or (isinstance(v, float) and math.isnan(v)):
                values.append("NULL")   # ✅ 强制转 SQL NULL
            elif isinstance(v, str):
                v = v.replace("'", "''")
                values.append(f"'{v}'")
            else:
                values.append(str(v))
        sql = f"INSERT INTO {table_name} ({', '.join(df.columns)}) VALUES ({', '.join(values)});"
        sql_statements.append(sql)
    return sql_statements


# sql 
all_sql = []
for csv, table in csv_files.items():
    try:
        all_sql.extend(csv_to_sql(csv, table))
        print(f"✅ Processed {csv} → {table}")
    except Exception as e:
        print(f"⚠️ Error processing {csv}: {e}")

with open(output_file, "w", encoding="utf-8") as f:
    f.write("\n".join(all_sql))

print(f"🎉 SQL insert statements have been written to {output_file}")
