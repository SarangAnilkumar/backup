import pandas as pd

merged_df = pd.read_csv('AusRecom_nutrition_cleanning.csv')
    # concat Nutrient and Unit 
merged_df["Nutrient_with_unit"] = merged_df["Nutrient"].str.cat(
    merged_df["Unit"], sep=" "
)


merged_df["Nutrient_with_unit"] = merged_df["Nutrient"] + " (" + merged_df["Unit"] + ")"

# check all uniques
unique_values = merged_df["Nutrient_with_unit"].unique()
print(unique_values)


# mappin dictionary
mapping = {
    "Energy(a) ((kJ))": "energy_with_fibre_kj",   # prob energy_without_fibre_kj needed
    "Protein ((g))": "protein_g",
    "Total Fat(c) ((g))": "fat_total_g",
    "Dietary Fibre ((g))": "total_dietary_fibre_g",
    "Carbohydrate(c) ((g))": "available_carbohydrate_without_sugar_alcohols_g",
    "Total sugars ((g))": "total_sugars_g",
    "Calcium ((mg))": "calcium_mg",
    "Iron ((mg))": "iron_mg",
    "Magnesium ((mg))": "magnesium_mg",
    "Potassium ((mg))": "potassium_mg",
    "Sodium(e) ((mg))": "sodium_mg",
    "Zinc ((mg))": "zinc_mg",
    "Vitamin C ((mg))": "vitamin_c_mg",
    "Thiamin (B1) ((mg))": "thiamin_b1_mg",
    "Riboflavin (B2) ((mg))": "riboflavin_b2_mg",
    "Niacin (B3) ((mg))": "niacin_b3_mg",
    "Vitamin B6 ((mg))": "pyridoxine_b6_mg",
    "Total Folates ((µg))": "folate_ug",
    "Vitamin A retinol equivalent ((µg))": "vitamin_a_ug",
    "Vitamin E ((mg))": "vitamin_e_mg"
}

# implement mappin
merged_df["Nutrient_standard"] = merged_df["Nutrient_with_unit"].map(mapping)

unmapped = merged_df[merged_df["Nutrient_standard"].isna()]["Nutrient_with_unit"].unique()
yes_map = merged_df.dropna()
yes_map.to_csv("Final_nutritionRecom.csv")