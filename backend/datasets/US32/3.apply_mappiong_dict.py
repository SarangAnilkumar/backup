import pandas as pd

#Step 1: Read data
recipes_expanded = pd.read_csv("recipes_expanded.csv")   # ingredient_clean
mapping_dict = pd.read_csv("mapping_dict.csv")
recipes_linked = pd.read_csv("recipes_all_linked_clean.csv")
raw_recipes = pd.read_csv("RAW_recipes.csv", usecols=["id","description","steps"])

#2: Build alias → public_food_key map
alias_map = dict(zip(mapping_dict["ingredient_alias"].str.lower(), mapping_dict["public_food_key"]))

#3: Apply mapping
recipes_expanded["ingredient_clean_lower"] = recipes_expanded["ingredient_clean"].str.lower()
recipes_expanded["mapped_food_key"] = recipes_expanded["ingredient_clean_lower"].map(alias_map)

#4: Merge with existing exact matches
recipes_linked_dict = dict(zip(recipes_linked["id"], recipes_linked["public_food_key"].apply(eval)))

extended_results = []
for rid, group in recipes_expanded.groupby("id"):
    existing_keys = set(recipes_linked_dict.get(rid, []))
    new_keys = set(group["mapped_food_key"].dropna().unique())
    all_keys = list(existing_keys.union(new_keys))

    extended_results.append({
        "id": rid,
        "name": group["name"].iloc[0],
        "ingredient_public_food_key_list": all_keys
    })

extended_df = pd.DataFrame(extended_results)

#5: Remove recipes with no matched ingredients
before_count = len(extended_df)
extended_df = extended_df[extended_df["ingredient_public_food_key_list"].apply(lambda x: len(x) > 0)]
after_count = len(extended_df)
removed_count = before_count - after_count

#6: Join back description & steps
final_df = extended_df.merge(raw_recipes, on="id", how="left")

#7: Save results
final_df.to_csv("recipes_all_linked_extended.csv", index=False)

print(f"Total recipes before filter: {before_count}")
print(f"Recipes removed (no matched ingredients): {removed_count}")
print(f"Final recipes with matched ingredients: {after_count}")
