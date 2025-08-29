library(readxl)
library(dplyr)
library(janitor)
library(stringr)

# -----------------------------
# 1. Data readin
# -----------------------------
food_details <- read_excel("Release 2 - Food Details.xlsx", sheet = "AFCD - Release 2")
measures     <- read_excel("Release 2 - Measure file.xlsx", sheet = "AFCD - Release 2")
nutrient_file <- read_excel("Release 2 - Nutrient file.xlsx", sheet = "All solids & liquids per 100g")
nutrient_details <- read_excel("Release 2 - Nutrient details.xlsx", sheet = "Index")
recipes <- read_excel("Release 2 - Recipe file.xlsx", sheet = "AFCD - Release 2")
retention <- read_excel("Release 2 - Retention Factors_0.xlsx", sheet = "Retention Factors")
references <- read_excel("Release 2 - Reference List.xlsx", sheet = "Reference List")
food_groups  <- read_excel("Release 2 - Food group information.xlsx", 
                           sheet = "Food group information", skip = 1) # foodgroup with one description in 1st row

# -----------------------------
# 2. clean the name of the cols
# -----------------------------
clean_names2 <- function(df) {
  df %>%
    janitor::clean_names() %>%
    rename_with(~str_replace_all(., "\\n", "_")) %>%
    rename_with(~str_replace_all(., "\\s+", "_"))
}

food_details <- clean_names2(food_details)
measures <- clean_names2(measures)
nutrient_file <- clean_names2(nutrient_file)
nutrient_details <- clean_names2(nutrient_details)
recipes <- clean_names2(recipes)
retention <- clean_names2(retention)
references <- clean_names2(references)

# -----------------------------
# 3. rename some splited words
# -----------------------------
nutrient_file <- nutrient_file %>%
  rename(
    energy_with_fibre_kj   = energy_with_dietary_fibre_equated_k_j,
    energy_without_fibre_kj = energy_without_dietary_fibre_equated_k_j,
    magnesium_mg = magnesium_mg_mg
  )

# -----------------------------
# 4. core nutrition
# -----------------------------
nutrient_selected <- nutrient_file %>%
  select(public_food_key,
         food_name,
         energy_with_fibre_kj,
         energy_without_fibre_kj,
         protein_g,
         fat_total_g,
         total_dietary_fibre_g,
         available_carbohydrate_without_sugar_alcohols_g,
         total_sugars_g,
         calcium_ca_mg,
         iron_fe_mg,
         magnesium_mg,
         potassium_k_mg,
         sodium_na_mg,
         zinc_zn_mg,
         vitamin_c_mg,
         thiamin_b1_mg,
         riboflavin_b2_mg,
         niacin_b3_mg,
         pyridoxine_b6_mg,
         folate_natural_ug,
         vitamin_a_retinol_equivalents_ug,
         vitamin_e_mg)# this is all nutritions that dataset provides, Prob  will break down with less if needed(ARTICLE NEEDED)

# -----------------------------
# 5. foodgroup concat
# -----------------------------
food_master <- nutrient_selected %>%
  left_join(food_details %>% 
              select(public_food_key, classification, classification_name),
            by = "public_food_key")

# -----------------------------
# 6. output
# -----------------------------
write.csv(food_master, "master_nutrients.csv", row.names = FALSE)
