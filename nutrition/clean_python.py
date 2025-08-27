import pandas as pd

#1. readin files
food_details = pd.read_excel("Release 2 - Food Details.xlsx", sheet_name="AFCD - Release 2")
measures = pd.read_excel("Release 2 - Measure file.xlsx", sheet_name="AFCD - Release 2")
nutrient_file = pd.read_excel("Release 2 - Nutrient file.xlsx", sheet_name="All solids & liquids per 100g")
nutrient_details = pd.read_excel("Release 2 - Nutrient details.xlsx", sheet_name="Index")
recipes = pd.read_excel("Release 2 - Recipe file.xlsx", sheet_name="AFCD - Release 2")
retention = pd.read_excel("Release 2 - Retention Factors_0.xlsx", sheet_name="Retention Factors")
references = pd.read_excel("Release 2 - Reference List.xlsx", sheet_name="Reference List")
food_groups = pd.read_excel("Release 2 - Food group information.xlsx",
                            sheet_name="Food group information", skiprows=1)# this has 1 description in 1st row

#2. col name cleanning using regexp
def clean_names(df):
    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r"\n", "_", regex=True)
        .str.replace(r"\s+", "_", regex=True)
        .str.replace(r",", "", regex=True)
        .str.replace(r"__+", "_", regex=True)   # __→_
        .str.replace(r"[()]", "", regex=True)
    )
    return df

food_details = clean_names(food_details)
measures = clean_names(measures)
nutrient_file = clean_names(nutrient_file)
nutrient_details = clean_names(nutrient_details)
recipes = clean_names(recipes)
retention = clean_names(retention)
references = clean_names(references)
food_groups = clean_names(food_groups)

#rename_map
rename_map = {
    "energy_with_dietary_fibre_equated_kj": "energy_with_fibre_kj",
    "energy_without_dietary_fibre_equated_kj": "energy_without_fibre_kj",
    "protein_g": "protein_g",
    "fat_total_g": "fat_total_g",
    "total_dietary_fibre_g": "total_dietary_fibre_g",
    "available_carbohydrate_without_sugar_alcohols_g": "available_carbohydrate_without_sugar_alcohols_g",
    "total_sugars_g": "total_sugars_g",
    "calcium_ca_mg": "calcium_mg",
    "iron_fe_mg": "iron_mg",
    "magnesium_mg_mg": "magnesium_mg",   
    "magnesium_mg": "magnesium_mg",
    "potassium_k_mg": "potassium_mg",
    "sodium_na_mg": "sodium_mg",
    "zinc_zn_mg": "zinc_mg",  
    "zinc_mg": "zinc_mg",     
    "vitamin_c_mg": "vitamin_c_mg",
    "thiamin_b1_mg": "thiamin_b1_mg",
    "riboflavin_b2_mg": "riboflavin_b2_mg",
    "niacin_b3_mg": "niacin_b3_mg",
    "pyridoxine_b6_mg": "pyridoxine_b6_mg",
    "folate_natural_ug": "folate_ug",
    "vitamin_a_retinol_equivalents_ug": "vitamin_a_ug",
    "vitamin_e_mg": "vitamin_e_mg"
}
nutrient_file = nutrient_file.rename(columns=rename_map)

# 4. choose core nutritions
nutrient_selected = nutrient_file[
    [
     
        #basic information
        "public_food_key",
        "food_name",
        #energy
        "energy_with_fibre_kj",
        "energy_without_fibre_kj",
        #macronutrients
        "protein_g",
        "fat_total_g",
        "total_dietary_fibre_g",
        "available_carbohydrate_without_sugar_alcohols_g",# actually if you want to calculate real carbonhydrate stuff you need to add alcohols and sugar
        "total_sugars_g",#so total carbonhydate=total_dietary_fibre_g+available_carbohydrate_without_sugar_alcohols_g+total_sugars_g
        
        #micronutrients
        #mineral
        "calcium_mg",
        "iron_mg",
        "magnesium_mg",
        "potassium_mg",
        "sodium_mg",
        "zinc_mg",
        #vitamins
        "vitamin_c_mg",
        "thiamin_b1_mg",
        "riboflavin_b2_mg",
        "niacin_b3_mg",
        "pyridoxine_b6_mg",
        "folate_ug",
        "vitamin_a_ug",
        "vitamin_e_mg",
    ]
]

# 5. concat foodgroup info
food_master = nutrient_selected.merge(
    food_details[["public_food_key", "classification", "classification_name"]],
    on="public_food_key",
    how="left"
)

# 6. output
food_master.to_csv("master_nutrients_final.csv", index=False, encoding="utf-8-sig")

 