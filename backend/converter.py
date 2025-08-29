import pandas as pd
import os

# 1.data readin
folder = "./datasets/"   
food_file = os.path.join(folder, "Nutrient/master_nutrients_final.csv")
recom_file = os.path.join(folder, "AusNutri_RecomFinal/nutritionRecom.csv")
food_df = pd.read_csv(food_file)
recom_df = pd.read_csv(recom_file)

# 2.cleanning the recom table from wide to long
#Q:why wide to long?
#A:Normalization and increase flexibility in query. Not suitable for human read but definitely good for database
age_cols = ['2-3','4-8','9-13','14-18','19-30','31-50','51-70','71_and_over']

recom_long = recom_df.melt(
    id_vars=['Nutrient','Unit','Category','Gender','Nutrient_standard'],
    value_vars=age_cols,
    var_name="age_group",
    value_name="recommended_amount"
)

# dropnull
recom_long = recom_long.dropna(subset=["recommended_amount"])

#age_group to age_start and age_end
#why? If user can input the age, just compare with age start/end to see which bracket this user is in.
def parse_age_group(age_str):
    if "and_over" in age_str:
        start = int(age_str.split("_")[0])
        end = 144   # set the age upper threshhold
    else:
        start, end = map(int, age_str.split("-"))
    return pd.Series([start, end])

recom_long[["age_start","age_end"]] = recom_long["age_group"].apply(parse_age_group)

# 3. build Nutrient dimension 
nutrient_dim = recom_long[['Nutrient_standard','Nutrient','Unit','Category']].drop_duplicates()
nutrient_dim = nutrient_dim.rename(columns={
    "Nutrient_standard":"nutrient_code",
    "Nutrient":"nutrient_name",
    "Unit":"unit",
    "Category":"category"
})

# delete energy_without_fibre_kj and vitamin_a_ug
#why? Since energy_without_fibre_kj is redundant to the energy calculation and vitamin_a_ug is not in the daily consumption recom
nutrient_dim = nutrient_dim[~nutrient_dim["nutrient_code"].isin(["energy_without_fibre_kj", "vitamin_a_ug"])]

# create nutrient_id
nutrient_dim["nutrient_id"] = range(1, len(nutrient_dim)+1)

# 4.  convert food table into long
food_long = food_df.melt(
    id_vars=['public_food_key','food_name','classification','classification_name'],
    var_name="nutrient_code",
    value_name="amount_per_100g"
)

# delete unnecessary nutrients
food_long = food_long[~food_long["nutrient_code"].isin(["energy_without_fibre_kj", "vitamin_a_ug"])]

# 5. food nutrients(LONG)
food_nutrients = food_long.merge(nutrient_dim, on="nutrient_code", how="left")

# Recom table（Longtable + nutrient_id + age_start/end）
recom_final = recom_long.merge(nutrient_dim, left_on="Nutrient_standard", right_on="nutrient_code", how="inner")

# 6. save to csv
food_nutrients.to_csv(os.path.join(folder,"food_nutrients_long.csv"), index=False)
nutrient_dim.to_csv(os.path.join(folder,"nutrient_dimension.csv"), index=False)
recom_final.to_csv(os.path.join(folder,"nutrition_recommendations_long.csv"), index=False)
