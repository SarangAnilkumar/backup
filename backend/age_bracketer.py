import pandas as pd

# 1. read file
path="./datasets"
recom = pd.read_csv(path+"/output/nutrition_recommendations_long.csv")
recom["age_end"] = recom["age_end"].fillna(200)

# 2. AGE_SEX_FILTER 
age_filters = pd.DataFrame([
    (1, 15, 17, 'Persons'),
    (2, 15, 17, 'Males'),
    (3, 15, 17, 'Females'),
    (4, 18, 24, 'Persons'),
    (5, 18, 24, 'Males'),
    (6, 18, 24, 'Females'),
    (7, 25, 34, 'Persons'),
    (8, 25, 34, 'Males'),
    (9, 25, 34, 'Females'),
    (10, 35, 44, 'Persons'),
    (11, 35, 44, 'Males'),
    (12, 35, 44, 'Females'),
    (13, 45, 54, 'Persons'),
    (14, 45, 54, 'Males'),
    (15, 45, 54, 'Females'),
    (16, 55, 64, 'Persons'),
    (17, 55, 64, 'Males'),
    (18, 55, 64, 'Females'),
    (19, 65, 200, 'Persons'),   # NULL → 200 for processing
    (20, 65, 200, 'Males'),
    (21, 65, 200, 'Females')
], columns=["filter_id","filter_age_start","filter_age_end","filter_sex"])

# 3. manual mappin
mapping = {
    "14-18": ["15-17"],
    "19-30": ["18-24", "25-34"],   # 25–34 uses 19–30
    "31-50": ["35-44", "45-54"],   # 45–54 uses 31–50
    "51-70": ["55-64", "65-200"],  # 65+ uses 51–70
}

# 4. new recom table
rows = []
for _, rec in recom.iterrows():
    rec_start, rec_end = rec["age_start"], rec["age_end"]
    old_range = f"{rec_start}-{rec_end if rec_end != 200 else '200'}"

    if old_range in mapping:
        for new_range in mapping[old_range]:
            f_start, f_end = map(int, new_range.split("-"))

            # Check filter_id (age + sex)
            match = age_filters[
                (age_filters["filter_age_start"] == f_start) &
                (age_filters["filter_age_end"] == f_end) &
                (age_filters["filter_sex"] == rec["Gender"])
            ]
            filter_id = match.iloc[0]["filter_id"] if not match.empty else None

            rows.append({
                "nutrient_id": rec["nutrient_id"],
                "nutrient_name": rec["nutrient_name"],
                "unit": rec["unit"],
                "sex": rec["Gender"],
                "recommended_amount": rec["recommended_amount"],
                "filter_id": filter_id,
                "new_age_start": f_start,
                "new_age_end": None if f_end == 200 else f_end
            })

new_recom = pd.DataFrame(rows)

# 5. save 
new_recom.to_csv(path+"/output/nutrition_recommendations_refined.csv", index=False)
