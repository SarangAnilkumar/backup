import pandas as pd
from rapidfuzz import process, fuzz

#1: Load data

recipes_expanded = pd.read_csv("recipes_expanded.csv")  # must contain ingredient_clean
foods = pd.read_csv("master_nutrients_final.csv", usecols=["public_food_key", "food_name"])

ingredients = recipes_expanded["ingredient_clean"].dropna().str.lower().unique()
foods["food_name_lower"]=foods["food_name"].str.lower()
food_names = foods["food_name"].tolist()

#2: Generate mapping

mapping_candidates = []
for ing in ingredients:
    match = process.extractOne(
        ing,
        food_names,
        scorer=fuzz.token_sort_ratio
    )
    if match:
        best_name, score, idx = match
        if score >= 80:  # threshold can be tuned
            food_key = foods.iloc[idx]["public_food_key"]
            mapping_candidates.append([ing, food_key, best_name, score])

#3: save files
df = pd.DataFrame(mapping_candidates, columns=["ingredient_alias","public_food_key","food_name","similarity"])
df.to_csv("mapping_dict.csv", index=False, quoting=1)  # quoting=1 ensures quotes around fields with commas

print(f"mapping_dict.csv generated with {len(df)} mappings")
