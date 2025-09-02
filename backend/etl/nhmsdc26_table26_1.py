import pandas as pd
import re

# ---------------------------
# Small, simple, shared utils
# ---------------------------

STAR_RE   = re.compile(r"\*+")
COMMA_RE  = re.compile(r",")
FOOTNOTE_RE = re.compile(r"\(([a-z]|[a-z]\d?)\)", flags=re.I)  # (a), (b1) etc.

def clean_label_keep_units(s):
    """Trim, keep units/descriptors, remove footnote letters and stars, normalize dashes."""
    if not isinstance(s, str):
        return ""
    s = s.replace("–", "-").replace("—", "-").replace("\n", " ").strip()
    s = STAR_RE.sub("", s)
    s = FOOTNOTE_RE.sub("", s)
    s = re.sub(r"\s{2,}", " ", s)
    return s

def parse_value(cell):
    """Return (float_or_none, starred_flag). Strips commas and '*'."""
    if pd.isna(cell):
        return None, 0
    s = str(cell).strip()
    starred = 1 if STAR_RE.search(s) else 0
    s = STAR_RE.sub("", s)
    s = COMMA_RE.sub("", s)
    try:
        return float(s), starred
    except ValueError:
        return None, starred

def find_header_row(df, search_up_to=50):
    """Find the row with both year labels (e.g., 2011 and 2022 present)."""
    for i in range(min(search_up_to, len(df))):
        txt = " ".join(str(x) for x in df.iloc[i].dropna())
        if "2011" in txt and "2022" in txt:
            return i
    return 5  # fallback; works for most sheets

def classify_scope(label):
    """Map denominator line to a simple scope code."""
    l = label.lower()
    if "blood and urine" in l: return "blood_and_urine"
    if "fasting blood" in l:  return "fasting_blood"
    if "urine" in l:          return "urine"
    if "blood" in l:          return "blood"
    return None

def is_footer_or_note(text):
    """Skip long notes/footers/methodology."""
    if not text: return True
    t = text.lower()
    starters = (
        "results may differ", "cells in this table", "between 2011-12",
        "between 2011–12", "in the nhms", "see the methodology", "©", "australian bureau"
    )
    return t.startswith(starters)

# -------------------------------------------
# 26.1 — Chronic disease biomarkers (persons)
# -------------------------------------------

def process_chronic_biomarkers(filepath, sheet_name=None):
    """
    Parse Table 26.1 (persons 18+; 2011–12 and 2022–24).
    Returns: data_df (indicator counts) and denom_df (denominators).
    """
    if sheet_name is None:
        # auto-pick a sheet containing "table 26.1" and "estimate"
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 26.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)

    hdr = find_header_row(df)
    # Years are in the header row (skip first column which is label)
    years = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    year_cols = list(range(1, 1 + len(years)))

    data = df.iloc[hdr+1:].reset_index(drop=True)

    data_rows = []
    denom_rows = []
    current_group = None
    current_subgroup = None

    for idx, row in data.iterrows():
        first_col = row.iloc[0]
        if pd.isna(first_col):
            continue
        label_raw = str(first_col).strip()
        label = clean_label_keep_units(label_raw)
        if not label or is_footer_or_note(label):
            continue

        # header lines (no data in other columns)
        if row.iloc[1:].isnull().all():
            # New section header or subgroup
            # Heuristic: if label starts with "Total " it's not a header; otherwise treat as header
            if not label.lower().startswith("total "):
                # If we already have a group and see another header, set as subgroup; else as group
                if current_group is None:
                    current_group = label
                    current_subgroup = None
                else:
                    current_subgroup = label
                continue

        # denominator lines
        if label.lower().startswith("total ") and "results" in label.lower():
            scope = classify_scope(label)
            for i, yc in enumerate(year_cols):
                val, star = parse_value(row.iloc[yc])
                denom_rows.append({
                    "year": years[i],
                    "group": current_group,
                    "subgroup": current_subgroup,
                    "denominator_label": label,
                    "test_scope": scope,
                    "denominator_value_000": val,
                    "starred_flag": star
                })
            continue

        # skip total persons / "No ... results"
        if label.lower().startswith("total persons") or label.lower().startswith("no "):
            continue

        # indicator row (category: Normal/Abnormal/Has/etc.)
        for i, yc in enumerate(year_cols):
            val, star = parse_value(row.iloc[yc])
            if val is None:
                continue
            data_rows.append({
                "year": years[i],
                "group": current_group,
                "subgroup": current_subgroup,
                "category": label,               # e.g., "Abnormal (≥5.5 mmol/L)" (units kept)
                "count_000": val,
                "starred_flag": star
            })

    return pd.DataFrame(data_rows), pd.DataFrame(denom_rows)

# -----------------------------------------
# 10.1 — Risk factors (BMI/waist/smoking…)
# -----------------------------------------

def process_risk_factors(filepath, sheet_name=None):
    """
    Parse Table 10.1 (risk factor categories across columns).
    Returns: data_df, denom_df
    """
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 10.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    df = df.copy()

    hdr = find_header_row(df)
    # two header lines: risk factor type row then category row
    # We’ll read types from row hdr-1 and categories from row hdr
    # (often the table has multi-row headers; this approach is robust enough)
    types_row = df.loc[hdr-1, 1:].tolist()
    cats_row  = df.loc[hdr,   1:].tolist()

    rf_types = {}
    rf_cats  = {}
    last_type = None
    for c, t in enumerate(types_row, start=1):
        if pd.notna(t):
            last_type = clean_label_keep_units(t)
        rf_types[c] = last_type
        cat = cats_row[c-1]
        rf_cats[c] = clean_label_keep_units(cat) if pd.notna(cat) else None

    data = df.iloc[hdr+1:].reset_index(drop=True)

    data_rows, denom_rows = [], []
    current_group = None
    current_subgroup = None
    in_group = False

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label_raw = str(first).strip()
        label = clean_label_keep_units(label_raw)
        if not label or is_footer_or_note(label):
            continue

        # header (no right-side data)
        if row.iloc[1:].isnull().all():
            if not in_group:
                current_group = label
                current_subgroup = None
                in_group = True
            else:
                current_subgroup = label
            continue

        # denominator line
        if label.lower().startswith("total ") and "results" in label.lower():
            scope = classify_scope(label)
            for col in range(1, df.shape[1]):
                denom_val, star = parse_value(row.iloc[col])
                if denom_val is None: 
                    continue
                denom_rows.append({
                    "risk_factor_type": rf_types.get(col),
                    "risk_factor_category": rf_cats.get(col),
                    "group": current_group,
                    "subgroup": current_subgroup,
                    "denominator_label": label,
                    "test_scope": scope,
                    "denominator_value_000": denom_val,
                    "starred_flag": star
                })
            continue

        if label.lower().startswith("total persons"):
            continue

        # indicator value (count per risk-factor column)
        for col in range(1, df.shape[1]):
            val, star = parse_value(row.iloc[col])
            if val is None:
                continue
            data_rows.append({
                "risk_factor_type": rf_types.get(col),
                "risk_factor_category": rf_cats.get(col),
                "group": current_group,
                "subgroup": current_subgroup,
                "category": label,
                "count_000": val,
                "starred_flag": star
            })

    return pd.DataFrame(data_rows), pd.DataFrame(denom_rows)

# ----------------------------------------------------
# 25.1 — Nutrient biomarkers (Females; means/medians)
# ----------------------------------------------------

IQR_RE = re.compile(r"\(([^,]+),\s*([^)]+)\)")

def _parse_iqr(val):
    if not isinstance(val, str):
        return None, None
    m = IQR_RE.search(val)
    if not m:
        return None, None
    lo = float(COMMA_RE.sub("", m.group(1)))
    hi = float(COMMA_RE.sub("", m.group(2)))
    return lo, hi

def process_nutrient_biomarkers_females(filepath, sheet_name=None):
    """
    Parse Table 25.1 (nutrient biomarkers — females by age groups).
    Returns a tidy DataFrame with measures: mean, median, iqr_low, iqr_high, count_000, denominators.
    """
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 25.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    hdr = find_header_row(df)
    age_cols = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    age_idx = list(range(1, 1 + len(age_cols)))
    data = df.iloc[hdr+1:].reset_index(drop=True)

    rows = []
    current_group = None

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text):
            continue

        if row.iloc[1:].isnull().all():
            current_group = text
            continue

        if text.startswith("Mean "):
            indicator = text.replace("Mean ", "", 1)
            for c, age in zip(age_idx, age_cols):
                val, star = parse_value(row.iloc[c])
                rows.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                             "measure": "mean", "value": val, "starred_flag": star})
            continue

        if text.startswith("Median "):
            indicator = text.replace("Median ", "", 1)
            for c, age in zip(age_idx, age_cols):
                val, star = parse_value(row.iloc[c])
                rows.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                             "measure": "median", "value": val, "starred_flag": star})
            continue

        if text.startswith("Interquartile range "):
            indicator = text.replace("Interquartile range ", "", 1)
            for c, age in zip(age_idx, age_cols):
                lo, hi = _parse_iqr(row.iloc[c])
                if lo is not None:
                    rows.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                                 "measure": "iqr_low", "value": lo, "starred_flag": 0})
                    rows.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                                 "measure": "iqr_high", "value": hi, "starred_flag": 0})
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            denom_type = text.replace("Total ", "", 1).replace(" results", "").strip()
            for c, age in zip(age_idx, age_cols):
                val, star = parse_value(row.iloc[c])
                rows.append({"age_group": age, "indicator": f"{current_group} – denominator",
                             "measure": denom_type, "value": val, "starred_flag": star})
            continue

        # category counts (e.g., normal/abnormal; adequate/deficient)
        category = text
        for c, age in zip(age_idx, age_cols):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            rows.append({"age_group": age, "indicator": f"{current_group} – {category}",
                         "measure": "count_000", "value": val, "starred_flag": star})

    return pd.DataFrame(rows)

# -------------------------------------------------
# 27.1 — Nutrient biomarkers by year (means/medians)
# -------------------------------------------------

def process_nutrient_biomarkers_years(filepath, sheet_name=None):
    """Parse Table 27.1 (nutrient biomarkers by year)."""
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 27.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    hdr = find_header_row(df)
    years = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    year_cols = list(range(1, 1 + len(years)))
    data = df.iloc[hdr+1:].reset_index(drop=True)

    rows = []
    current_group = None

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first): continue
        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text): continue

        if row.iloc[1:].isnull().all():
            current_group = text
            continue

        if text.startswith("Mean "):
            indicator = text.replace("Mean ", "", 1)
            for c, year in zip(year_cols, years):
                val, star = parse_value(row.iloc[c])
                rows.append({"year": year, "indicator": f"{current_group} – {indicator}",
                             "measure": "mean", "value": val, "starred_flag": star})
            continue

        if text.startswith("Median "):
            indicator = text.replace("Median ", "", 1)
            for c, year in zip(year_cols, years):
                val, star = parse_value(row.iloc[c])
                rows.append({"year": year, "indicator": f"{current_group} – {indicator}",
                             "measure": "median", "value": val, "starred_flag": star})
            continue

        if text.startswith("Interquartile range "):
            indicator = text.replace("Interquartile range ", "", 1)
            for c, year in zip(year_cols, years):
                lo, hi = _parse_iqr(row.iloc[c])
                if lo is not None:
                    rows.append({"year": year, "indicator": f"{current_group} – {indicator}",
                                 "measure": "iqr_low", "value": lo, "starred_flag": 0})
                    rows.append({"year": year, "indicator": f"{current_group} – {indicator}",
                                 "measure": "iqr_high", "value": hi, "starred_flag": 0})
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            denom_type = text.replace("Total ", "", 1).replace(" results", "").strip()
            for c, year in zip(year_cols, years):
                val, star = parse_value(row.iloc[c])
                rows.append({"year": year, "indicator": f"{current_group} – denominator",
                             "measure": denom_type, "value": val, "starred_flag": star})
            continue

        # category counts
        category = text
        for c, year in zip(year_cols, years):
            val, star = parse_value(row.iloc[c])
            if val is None: continue
            rows.append({"year": year, "indicator": f"{current_group} – {category}",
                         "measure": "count_000", "value": val, "starred_flag": star})
    return pd.DataFrame(rows)

# ----------------------------------------------------
# 22.1 — Vitamin D by season and state (status bands)
# ----------------------------------------------------

def _classify_vitd(text):
    t = text.lower()
    if "deficient" in t:    return "deficient"
    if "insufficient" in t: return "insufficient"
    if "sufficient" in t or "adequate" in t: return "sufficient"
    return None

def process_vitaminD_season_state(filepath, sheet_name=None):
    """Parse Table 22.1 (vitamin D status by season and state)."""
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 22.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    hdr = find_header_row(df)
    states = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    state_cols = list(range(1, 1 + len(states)))
    data = df.iloc[hdr+1:].reset_index(drop=True)

    rows = []
    current_season = None

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first): continue
        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text): continue

        if row.iloc[1:].isnull().all():
            current_season = text
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            for c, state in zip(state_cols, states):
                val, star = parse_value(row.iloc[c])
                rows.append({"season": current_season, "state": state,
                             "measure": "denominator_blood_test", "value": val, "starred_flag": star})
            continue

        if text.lower().startswith("total persons"):
            continue

        status = _classify_vitd(text)
        if status is None:
            continue

        for c, state in zip(state_cols, states):
            val, star = parse_value(row.iloc[c])
            if val is None: continue
            rows.append({"season": current_season, "state": state,
                         "vitaminD_status": status, "measure": "count_000",
                         "value": val, "starred_flag": star})

    return pd.DataFrame(rows)

# ------------------------------------------
# 8.1 — Kidney biomarkers by sex (eGFR/ACR)
# ------------------------------------------

def process_kidney_biomarkers(filepath, sheet_name=None):
    """Parse Table 8.1 (kidney disease biomarkers by sex)."""
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 8.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    hdr = find_header_row(df)
    sexes = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    sex_cols = list(range(1, 1 + len(sexes)))
    data = df.iloc[hdr+1:].reset_index(drop=True)

    rows = []
    current_group = None
    sub_group = None

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first): continue
        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text): continue

        if row.iloc[1:].isnull().all():
            current_group = text
            sub_group = None
            continue

        if text.lower().startswith(("egfr", "albumin", "indicators")):
            sub_group = text
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            denom_type = text.replace("Total ", "", 1).replace("results", "").strip()
            for c, sex in zip(sex_cols, sexes):
                val, star = parse_value(row.iloc[c])
                rows.append({"sex": sex, "indicator": f"{current_group} – denominator",
                             "measure": denom_type, "value": val, "starred_flag": star})
            continue

        if text.lower().startswith("total"):
            continue

        # category counts (Normal/Abnormal/Presence…)
        for c, sex in zip(sex_cols, sexes):
            val, star = parse_value(row.iloc[c])
            if val is None: continue
            rows.append({"sex": sex,
                         "indicator": f"{current_group} – {sub_group} – {text}",
                         "measure": "count_000", "value": val, "starred_flag": star})
    return pd.DataFrame(rows)

# -----------------------------------------
# 9.1 — Liver biomarkers by sex (ALT/AST/GGT)
# -----------------------------------------

def process_liver_biomarkers(filepath, sheet_name=None):
    """Parse Table 9.1 (liver function biomarkers by sex)."""
    if sheet_name is None:
        xl = pd.ExcelFile(filepath)
        picks = [s for s in xl.sheet_names if "table 9.1" in s.lower() and "estimate" in s.lower()]
        sheet_name = picks[0] if picks else xl.sheet_names[0]

    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    hdr = find_header_row(df)
    sexes = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    sex_cols = list(range(1, 1 + len(sexes)))
    data = df.iloc[hdr+1:].reset_index(drop=True)

    rows = []
    current_group = None
    sub_group = None

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first): continue
        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text): continue

        if row.iloc[1:].isnull().all():
            current_group = text
            sub_group = None
            continue

        if "alt (u/l) range" in text.lower():
            sub_group = "ALT"
            continue
        if "ast (u/l) range" in text.lower():
            sub_group = "AST"
            continue
        if "ggt (u/l) range" in text.lower():
            sub_group = "GGT"
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            denom_type = text.replace("Total ", "", 1).replace("results", "").strip()
            for c, sex in zip(sex_cols, sexes):
                val, star = parse_value(row.iloc[c])
                rows.append({"sex": sex, "indicator": f"{current_group} – denominator",
                             "measure": denom_type, "value": val, "starred_flag": star})
            continue

        if text.lower().startswith("total"):
            continue

        # category counts by enzyme range
        for c, sex in zip(sex_cols, sexes):
            val, star = parse_value(row.iloc[c])
            if val is None: continue
            rows.append({"sex": sex,
                         "indicator": f"{current_group} – {sub_group} – {text}",
                         "measure": "count_000", "value": val, "starred_flag": star})
    return pd.DataFrame(rows)

# ---------------------------------
# Example usage (optional, simple)
# ---------------------------------
if __name__ == "__main__":
    # Adjust paths as needed (run from your repo root or backend/etl/)
    # Chronic biomarkers (Table 26.1)
    d26, den26 = process_chronic_biomarkers("backend/data_raw/NHMSDC26.xlsx")
    d26.to_csv("backend/data_clean/chronic_indicators.csv", index=False)
    den26.to_csv("backend/data_clean/chronic_denominators.csv", index=False)

    # Risk factors (Table 10.1)
    rf_data, rf_den = process_risk_factors("backend/data_raw/NHMSDC10.xlsx")
    rf_data.to_csv("backend/data_clean/riskfactor_indicators.csv", index=False)
    rf_den.to_csv("backend/data_clean/riskfactor_denominators.csv", index=False)

    # Nutrient biomarkers — females (Table 25.1)
    nf = process_nutrient_biomarkers_females("backend/data_raw/NHMSDC25.xlsx")
    nf.to_csv("backend/data_clean/nutrient_females.csv", index=False)

    # Nutrient biomarkers — years (Table 27.1)
    ny = process_nutrient_biomarkers_years("backend/data_raw/NHMSDC27.xlsx")
    ny.to_csv("backend/data_clean/nutrient_years.csv", index=False)

    # Vitamin D by season and state (Table 22.1)
    vds = process_vitaminD_season_state("backend/data_raw/NHMSDC22.xlsx")
    vds.to_csv("backend/data_clean/vitaminD_season_state.csv", index=False)

    # Kidney biomarkers (Table 8.1)
    k8 = process_kidney_biomarkers("backend/data_raw/NHMSDC08.xlsx")
    k8.to_csv("backend/data_clean/kidney_biomarkers.csv", index=False)

    # Liver biomarkers (Table 9.1)
    l9 = process_liver_biomarkers("backend/data_raw/NHMSDC09.xlsx")
    l9.to_csv("backend/data_clean/liver_biomarkers.csv", index=False)