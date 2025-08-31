
DROP DATABASE IF EXISTS recommend;
CREATE DATABASE recommend;
USE recommend;

-- 1.  NutrientDimension (from nutrient_dimension.csv)
CREATE TABLE NutrientDimension (
    nutrient_id INT PRIMARY KEY,
    nutrient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    category VARCHAR(100)
);

-- 2.  Food-Nutrient (from food_nutrients_long.csv)
--  public_food_key =food uniq id
CREATE TABLE FoodNutrient (
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_food_key VARCHAR(50) NOT NULL,
    nutrient_id INT NOT NULL,
    amount_per_100g FLOAT,
    FOREIGN KEY (nutrient_id) REFERENCES NutrientDimension(nutrient_id)
);

-- 3.  NutrientRecommendation (from nutrition_recommendations_refined.csv)
CREATE TABLE NutrientRecommendation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nutrient_id INT NOT NULL,
    sex ENUM('Males','Females','Persons') NOT NULL,
    age_start INT,
    age_end INT,
    recommended_amount FLOAT,
    unit VARCHAR(50),
    filter_id int,
    FOREIGN KEY (nutrient_id) REFERENCES NutrientDimension(nutrient_id)
);
