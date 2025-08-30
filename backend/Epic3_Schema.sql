-- 1. user info 
CREATE TABLE UserProfile (
    user_id SERIAL PRIMARY KEY,
    age INT NOT NULL,
    sex VARCHAR(10) NOT NULL CHECK (sex IN ('Males','Females','Persons')),
    weight_kg FLOAT,
    height_cm FLOAT
);

-- 2. food table 
CREATE TABLE FoodItem (
    food_id VARCHAR(20) PRIMARY KEY,  -- public_food_key
    food_name VARCHAR(255) NOT NULL,
    classification INT,
    classification_name VARCHAR(255)
);

-- 3. nutrient table 
CREATE TABLE Nutrient (
    nutrient_id SERIAL PRIMARY KEY,
    nutrient_code VARCHAR(100) UNIQUE NOT NULL,
    nutrient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,          -- g, mg, µg, kJ
    category VARCHAR(100)               -- Macronutrient, Vitamin, Mineral, etc.
);

-- 4. food-nutrient fact table 
CREATE TABLE FoodNutrient (
    food_id VARCHAR(20) NOT NULL,
    nutrient_id INT NOT NULL,
    amount_per_100g FLOAT,
    PRIMARY KEY (food_id, nutrient_id),
    FOREIGN KEY (food_id) REFERENCES FoodItem(food_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrient(nutrient_id)
);

-- 5. age-sex filter 
CREATE TABLE AgeSexFilter (
    filter_id INT PRIMARY KEY,
    filter_age_start INT NOT NULL,
    filter_age_end INT,   -- NULL 
    filter_sex VARCHAR(10) NOT NULL CHECK (filter_sex IN ('Males','Females','Persons'))
);

-- 6. refined nutrient recommendation 
CREATE TABLE NutrientRecommendation (
    nutrient_id INT NOT NULL,
    filter_id INT NOT NULL,
    recommended_amount FLOAT NOT NULL,
    unit VARCHAR(50),
    PRIMARY KEY (nutrient_id, filter_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrient(nutrient_id),
    FOREIGN KEY (filter_id) REFERENCES AgeSexFilter(filter_id)
);
