import pandas as pd

# readfile
path="./datasets"
recom = pd.read_csv(path+"/output/nutrition_recommendations_long.csv")
recom["age_end"] = recom["age_end"].fillna(200)

# new age bracket
age_filters = pd.DataFrame([
    (15, 17),
    (18, 24),
    (25, 34),
    (35, 44),
    (45, 54),
    (55, 64),
    (65, 144)  
], columns=["filter_age_start","filter_age_end"])

# manual mapping
mapping = {
    "14-18": ["15-17"],
    "19-30": ["18-24", "25-34"],   # 25–34 uses 19–30
    "31-50": ["35-44", "45-54"],   
    "51-70": ["55-64", "65-200"], 
}

# to new table
rows = []
for _, rec in recom.iterrows():
    rec_start, rec_end = rec["age_start"], rec["age_end"]
    old_range = f"{rec_start}-{rec_end if rec_end != 200 else '200'}"
    if old_range in mapping:
        for new_range in mapping[old_range]:
            f_start, f_end = map(int, new_range.split("-"))
            rows.append({
                "nutrient_id": rec["nutrient_id"],
                "nutrient_name": rec["nutrient_name"],
                "unit": rec["unit"],
                "sex": rec["Gender"],
                "old_age_range": old_range,
                "recommended_amount": rec["recommended_amount"],
                "new_age_start": f_start,
                "new_age_end": None if f_end==200 else f_end
            })

new_recom = pd.DataFrame(rows)
new_recom.to_csv(path+"/output/nutrition_recommendations_refined.csv", index=False)
