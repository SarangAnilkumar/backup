USE epic1;

DROP TABLE IF EXISTS ALCOHOL_FACT;
DROP TABLE IF EXISTS SMOKE_FACT;
DROP TABLE IF EXISTS AGE_SEX_FILTER;

CREATE TABLE AGE_SEX_FILTER (
    filter_id INT AUTO_INCREMENT PRIMARY KEY,
    filter_age_start INT NOT NULL,
    filter_age_end INT NULL,  -- allow NULL for open end (sucg as 65+)
    filter_sex ENUM('Persons','Male','Female','Males','Females','Other') NOT NULL,
    CONSTRAINT chk_age_bounds
      CHECK (filter_age_end IS NULL OR filter_age_end >= filter_age_start)
      );

CREATE TABLE SMOKE_FACT (
    smo_fact_id INT AUTO_INCREMENT PRIMARY KEY,
    filter_id INT NOT NULL,
    smo_fact_status ENUM('Current smoker', 'Ex-smoker', 'Never smoked') NOT NULL,
    smo_fact_device ENUM('Cigarette', 'Vape') NULL,
    smo_fact_frequency ENUM('Daily', 'Weekly', '1–2 days', '3–6 days') NULL,
    smo_fact_est_000 INT NOT NULL,

    CONSTRAINT fk_smoke_fact_filter FOREIGN KEY (filter_id)
        REFERENCES AGE_SEX_FILTER(filter_id),

    CONSTRAINT chk_device_frequency
        CHECK (
            (smo_fact_status = 'Current smoker' AND smo_fact_device IS NOT NULL AND smo_fact_frequency IS NOT NULL)
            OR
            (smo_fact_status IN ('Ex-smoker', 'Never smoked') AND smo_fact_device IS NULL AND smo_fact_frequency IS NULL)
        )
);

CREATE TABLE ALCOHOL_FACT (
    alco_fact_id INT AUTO_INCREMENT PRIMARY KEY,
    filter_id INT NOT NULL,
    alco_fact_status ENUM('Exceeded', 'Not Exceeded') NOT NULL,
    alco_fact_label VARCHAR(255) NOT NULL,
    alco_fact_low_bound FLOAT,
    alco_fact_up_bound FLOAT,
    alco_fact_est_000 INT NOT NULL,

    CONSTRAINT fk_alcohol_fact_filter FOREIGN KEY (filter_id)
        REFERENCES AGE_SEX_FILTER(filter_id)
);

-- check
SELECT * FROM AGE_SEX_FILTER;
SELECT * FROM SMOKE_FACT;
SELECT * FROM ALCOHOL_FACT;