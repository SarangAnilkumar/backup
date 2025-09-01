
import sys
from pathlib import Path
import pandas as pd

# --- Config ---
DATA_DIR = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data_clean")

# Expected headers per staging table
# We key by filename stem to keep it simple.
EXPECTED = {
    # S1
    "S1_Disease_5yrs_clean": [
        "data_year","sex","age_group","disease_group","disease",
        "yll","crude_yll_rate","yld","crude_yld_rate","daly","crude_daly_rate",
        "standard_population"
    ],
    # S8
    "S8_Risk_factor_linked_disease_clean": [
        "data_year","sex","age_group","risk_factor","cause_name",
        "attributable_deaths","deaths","pct_deaths_total",
        "attributable_yll","yll","pct_yll_total",
        "attributable_yld","yld","pct_yld_total",
        "attributable_daly","daly","pct_daly_total",
        "disease_group"
    ],
    # S9 (expects 'disease' not 'cause_name')
    "S9_Risk_factor_unadjusted_clean": [
        "data_year","sex","age_group","risk_factor","disease",
        "attributable_deaths","deaths","pct_deaths_total",
        "attributable_yll","yll","pct_yll_total",
        "attributable_yld","yld","pct_yld_total",
        "attributable_daly","daly","pct_daly_total",
        "disease_group"
    ],
    # NHS cubes expect survey_period/indicator/value_pct/est_thousand/note
    "nhs2022_cube08_clean": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "nhs2022_cube09_clean": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "nhs2022_cube10_clean": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    # Chronic indicators bundle
    "kidney_biomarkers": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "liver_biomarkers": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "chronic_indicators": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "chronic_prevalence": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
    "chronic_denominators": [
        "survey_period","sex","age_group","indicator","category","value_pct","est_thousand","note"
    ],
}

# Common header synonym map applied before final alignment
COMMON_SYNONYMS = {
    "year": "survey_period",
    "measure": "indicator",
    "proportion_pct": "value_pct",
    "proportion_%": "value_pct",
    "proportion_percent": "value_pct",
    "estimated_000": "est_thousand",
    "estimated_000s": "est_thousand",
    "estimated_thousand": "est_thousand",
    "count_000": "est_thousand",
    # S8/S9
    "cause": "cause_name",
    "cause_name": "disease",  # for S9 target; will be overwritten back for S8 via per-file mapping
}

# Per-file overrides (rename after COMMON_SYNONYMS)
PER_FILE_SYNONYMS = {
    "S8_Risk_factor_linked_disease_clean": {
        # Ensure S8 ends up with cause_name (not disease)
        "disease": "cause_name",
    }
}

def normalize_age_dash(series):
    if "age_group" not in series.index:
        return series
    # Replace ASCII hyphen '-' with en dash '–'
    series["age_group"] = str(series["age_group"]).replace("-", "–")
    return series

def process_file(csv_path: Path):
    stem = csv_path.stem
    target_headers = EXPECTED.get(stem)
    if not target_headers:
        print(f"Skip (no schema known): {csv_path.name}")
        return

    df = pd.read_csv(csv_path, dtype=str, keep_default_na=True, na_values=["", "NA", "NaN"])

    # Apply common synonyms
    df.rename(columns={c: COMMON_SYNONYMS.get(c, c) for c in df.columns}, inplace=True)

    # Apply per-file synonyms
    per_map = PER_FILE_SYNONYMS.get(stem, {})
    if per_map:
        df.rename(columns={c: per_map.get(c, c) for c in df.columns}, inplace=True)

    # Ensure all expected headers exist
    for col in target_headers:
        if col not in df.columns:
            df[col] = pd.NA

    # Drop extras and reorder
    df = df[target_headers]

    # Normalize age_group dashes
    if "age_group" in df.columns:
        df["age_group"] = df["age_group"].astype(str).str.replace("-", "–")

    # Best-effort numeric conversion for numeric-looking cols
    for c in df.columns:
        # crude heuristic: if most of the first 50 non-null values are numeric-like, cast
        series = df[c].dropna().head(50)
        if len(series) == 0:
            continue
        def is_num(x):
            s = str(x).strip()
            if s.count(".") <= 1 and s.replace(".","",1).replace("-","",1).isdigit():
                return True
            return False
        if sum(is_num(x) for x in series) >= int(0.7*len(series)):
            df[c] = pd.to_numeric(df[c], errors="coerce")

    df.to_csv(csv_path, index=False)
    print(f"Fixed: {csv_path.name}")

def main():
    if not DATA_DIR.exists():
        print(f"Data directory not found: {DATA_DIR.resolve()}")
        sys.exit(1)
    all_csvs = sorted(DATA_DIR.glob("*.csv"))
    for csv in all_csvs:
        process_file(csv)

if __name__ == "__main__":
    main()
