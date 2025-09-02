import pandas as pd
import ast
from rapidfuzz import process, fuzz

#1. data reading
recipes = pd.read_csv("RAW_recipes.csv", usecols=["id", "name", "description", "ingredients"])

recipes["ingredients"] = recipes["ingredients"].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) else x)
    #the ingredients are stored in str like:[1,2,3] make it a list
#cleaned data food with nutrition
foods = pd.read_csv("master_nutrients_final.csv", usecols=["public_food_key", "food_name"])

#2. data cleaning:# standardize the food names to make them can be aligned
def clean_food_name(s):
    if not isinstance(s, str):
        return ""
    return s.split(",")[0].lower().strip()
def clean_ingredient(s):
    if not isinstance(s, str):
        return ""
    return s.lower().strip()
foods["food_clean"] = foods["food_name"].apply(clean_food_name)

#3. openit, help food to map with ingredients
recipes_expanded = recipes.explode("ingredients").copy()

recipes_expanded["ingredient_raw"] = recipes_expanded["ingredients"]
recipes_expanded["ingredient_clean"] = recipes_expanded["ingredients"].apply(clean_ingredient)

# save the expanded result
recipes_expanded[["id", "name", "ingredient_raw", "ingredient_clean"]].to_csv(
    "recipes_expanded.csv", index=False
)

#4. match with ingredients
matched = recipes_expanded.merge(
    foods[["public_food_key", "food_clean"]],
    left_on="ingredient_clean",
    right_on="food_clean",
    how="inner"
)

#5.got the recipes with ingredients mapped key
recipes_linked = (
    matched.groupby(["id", "name"], as_index=False)
    .agg({"public_food_key": lambda x: list(set(x))})
)

recipes_linked.to_csv("recipes_all_linked_clean.csv", index=False)
print("recipe with key ingredients", len(recipes_linked))

#6. unused food (actually un)
food_usage = (
    matched.groupby("public_food_key")["id"].nunique().reset_index()
    .rename(columns={"id": "recipe_count"})
    .sort_values("recipe_count", ascending=False)
)
food_usage.to_csv("food_usage_stats_clean.csv", index=False)
print("food used", len(food_usage))

all_foods = set(foods["public_food_key"].unique())
used_foods = set(food_usage["public_food_key"].unique())
#unused food 
unused_foods = all_foods - used_foods
unused_df = foods[foods["public_food_key"].isin(unused_foods)].drop_duplicates()
unused_df.to_csv("unused_foods.csv", index=False)
print("food unused:", len(unused_df))
