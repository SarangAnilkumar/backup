import pandas as pd
import re
from pathlib import Path

# -----------------------------------------------------------------
# Helpers (simple & reusable)
# -----------------------------------------------------------------
STAR_RE = re.compile(r"\*+")
COMMA_RE = re.compile(r",")
FOOTNOTE_RE = re.compile(r"\(([a-z]|[a-z]\d?)\)", re.I)  # removes (a), (b), (c1) etc.
IQR_RE = re.compile(r"\(([^,]+),\s*([^)]+)\)")

def clean_label_keep_units(text):
    """Normalize label: keep units/descriptors, drop footnote letters/stars, normalize dash/space."""
    if not isinstance(text, str):
        return ""
    t = text.replace("–", "-").replace("—", "-").replace("\n", " ").strip()
    t = STAR_RE.sub("", t)
    t = FOOTNOTE_RE.sub("", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t

def parse_value(cell):
    """Return (float_or_None, starred_flag). Handles commas and trailing stars."""
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

def parse_iqr(val):
    if not isinstance(val, str):
        return None, None
    m = IQR_RE.search(val)
    if not m:
        return None, None
    lo = float(COMMA_RE.sub("", m.group(1)))
    hi = float(COMMA_RE.sub("", m.group(2)))
    return lo, hi

def find_header_row(df, search_up_to=60, contains=None):
    """
    Find the header row by scanning for keywords.
    - Default: looks for both '2011' and '2022' in the same row (year headers).
    - With contains=['males','females'] or ['nsw','act']: looks for those tokens.
    """
    for i in range(min(search_up_to, len(df))):
        row_txt = " ".join(str(x) for x in df.iloc[i].dropna()).lower()
        if contains:
            if all(k.lower() in row_txt for k in contains):
                return i
        else:
            if ("2011" in row_txt) and ("2022" in row_txt):
                return i
    return None  # let callers decide fallback

def is_footer_or_note(text):
    """Skip long footnotes/methodology blocks."""
    if not text:
        return True
    t = text.lower()
    return any(t.startswith(s) for s in (
        "results may differ",
        "cells in this table",
        "between 2011-12",
        "between 2011–12",
        "in the nhms",
        "see the methodology",
        "©",
        "australian bureau"
    ))

def classify_denom(label):
    """Map denominator label → scope code."""
    l = label.lower()
    if "blood and urine" in l:
        return "blood_and_urine"
    if "fasting blood" in l:
        return "fasting_blood"
    if "urine" in l:
        return "urine"
    if "blood" in l:
        return "blood"
    return None

# -----------------------------------------------------------------
# Table 26.1 (NHMSDC26): Chronic disease biomarkers — persons 18+
# -----------------------------------------------------------------

def _infer_scope_for_26(block, subgroup, category):
    """Heuristic mapping from block/subgroup/category to the correct denominator scope."""
    text = " ".join(str(x) for x in (block, subgroup, category) if x).lower()
    if "indicators of chronic kidney disease" in text:
        return "blood_and_urine"
    if any(k in text for k in ["ldl (bad) cholesterol", "triglycerides",
                               "dyslipidaemia", "fasting plasma glucose"]):
        return "fasting_blood"
    if any(k in text for k in ["hba1c", "hdl (good) cholesterol",
                               "total cholesterol", "haemoglobin", "egfr"]):
        return "blood"
    if any(k in text for k in ["albumin creatinine ratio", "albuminuria"]):
        return "urine"
    return "blood"

def process_chronic_biomarkers(xlsx_path):
    """
    Parse Table 26.1 (chronic disease biomarkers) and compute prevalence.
    Returns:
      counts_df  – tidy indicator counts (000s)
      rates_df   – indicator prevalence (%)
      denom_df   – denominators by block/subgroup/year/test_scope
    """
    # known top‑level blocks and diabetes prefixes
    BLOCK_TITLES = [
        "Cardiovascular disease biomarkers",
        "Diabetes",
        "Kidney disease biomarkers",
        "Anaemia"
    ]
    DIABETES_PREFIXES = ["Has diabetes", "Does not have diabetes"]

    xl = pd.ExcelFile(xlsx_path)
    sheet = _pick_sheet(xl, needle="table 26.1")
    df = xl.parse(sheet, header=None)

    # locate the year row and extract the year labels
    hdr, years = _header_and_years_for_26(df)
    year_cols = list(range(1, 1 + len(years)))
    data = df.iloc[hdr + 1:].reset_index(drop=True)

    counts_rows = []
    denom_rows  = []

    current_block  = None  # e.g. 'Cardiovascular disease biomarkers'
    current_group  = None  # second-level heading (e.g. 'Total cholesterol', 'HbA1c')
    current_prefix = None  # third-level prefix for diabetes ('Has diabetes', 'Does not have diabetes')

    for _, row in data.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label = clean_label_keep_units(str(first))
        if not label or is_footer_or_note(label):
            continue

        # header rows have no numeric values in the year columns
        if row.iloc[1:].isnull().all():
            if label in BLOCK_TITLES:
                current_block  = label
                current_group  = None
                current_prefix = None
            elif current_block == "Diabetes" and label in DIABETES_PREFIXES:
                # third-level heading inside the diabetes block
                current_prefix = label
            else:
                # second-level heading (analysis group)
                current_group  = label
                current_prefix = None
            continue

        lcl = label.lower()

        # denominator lines (e.g. 'Total blood test results', 'Total fasting blood test results')
        if lcl.startswith("total ") and "results" in lcl:
            scope = classify_denom(label)
            for i, c in enumerate(year_cols):
                val, star = parse_value(row.iloc[c])
                denom_rows.append({
                    "block": current_block,
                    "subgroup": current_group,
                    "year": years[i],
                    "denominator_label": label,
                    "test_scope": scope,
                    "denominator_000": val,
                    "starred_flag": star
                })
            continue

        # skip non-indicator totals and 'No ... results' lines
        if lcl.startswith("total persons"):
            continue
        if lcl.startswith("no ") and "results" in lcl:
            continue

        # indicator (category) lines
        for i, c in enumerate(year_cols):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            # build a descriptive category name
            if current_block == "Diabetes" and current_prefix:
                # prefix only with 'Has diabetes'/'Does not have diabetes'
                category_name = f"{current_prefix} – {label}"
            elif current_group:
                # prefix with the subgroup name (e.g. 'HDL (good) cholesterol – Normal')
                category_name = f"{current_group} – {label}"
            else:
                category_name = label
            counts_rows.append({
                "block": current_block,
                "subgroup": current_group,
                "year": years[i],
                "category": category_name,
                "count_000": val,
                "starred_flag": star
            })

    # assemble DataFrames
    counts_df = pd.DataFrame(counts_rows)
    denom_df  = pd.DataFrame(denom_rows)

    # de-duplicate denominators (take one per block/subgroup/year/test_scope)
    denom_df = denom_df.drop_duplicates(subset=["block", "subgroup", "year", "test_scope"])

    # infer the appropriate test scope for each indicator
    counts_df["test_scope"] = counts_df.apply(
        lambda r: _infer_scope_for_26(r["block"], r["subgroup"], r["category"]), axis=1
    )

    # join counts to denominators and compute prevalence
    rates_df = counts_df.merge(
        denom_df,
        how="left",
        on=["block", "subgroup", "year", "test_scope"]
    )
    rates_df["prevalence_pct"] = (
        rates_df["count_000"] / rates_df["denominator_000"] * 100
    ).round(2)

    # keep only rows with non-null prevalence
    rates_df = rates_df.dropna(subset=["prevalence_pct"])[
        ["block", "subgroup", "year", "category",
         "test_scope", "prevalence_pct", "starred_flag_x"]
    ].rename(columns={"starred_flag_x": "starred_flag"})

    return counts_df, rates_df, denom_df


# -----------------------------------------------------------------
# Functions reused from original script (no changes)
# -----------------------------------------------------------------

def _pick_sheet(xl, needle="table 26.1"):
    # Prefer a sheet name that includes both "table 26.1" and "estimate"
    cands = [s for s in xl.sheet_names if needle in s.lower()]
    if not cands:
        raise ValueError("Could not find Table 26.1 sheet in workbook.")
    est = [s for s in cands if "estimate" in s.lower()]
    return est[0] if est else cands[0]

def _header_and_years_for_26(df):
    """Find the row with the year headers and return (row_index, list_of_years)."""
    hdr = find_header_row(df)
    def _years_from_row(r):
        vals = [clean_label_keep_units(x) for x in df.loc[r, 1:].dropna().tolist()]
        return vals
    tried = []
    if hdr is not None:
        years = _years_from_row(hdr)
        tried.append(hdr)
        if any("2011" in str(y) for y in years) and any("2022" in str(y) for y in years):
            return hdr, years
    for guess in (4, 5, 6):
        if guess in tried:
            continue
        years = _years_from_row(guess)
        if years:
            if any("2011" in str(y) for y in years) and any("2022" in str(y) for y in years):
                return guess, years
    for guess in range(min(12, len(df))):
        years = _years_from_row(guess)
        if len(years) >= 2:
            return guess, years
    raise ValueError("Could not locate 26.1 year header row.")

# -----------------------------------------------------------------
# Table 10.1 (NHMSDC10): Risk factors (BMI/waist/smoking/BP)
# -----------------------------------------------------------------
def process_risk_factors(xlsx_path):
    """
    Parse NHMSDC10 Table 10.1.
    Returns: data_df (counts) and denom_df (denominators per risk-factor column)
    """
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 10.1" in s.lower())
    df = xl.parse(sheet, header=None)

    hdr = find_header_row(df)
    if hdr is None:
        # common fallback
        hdr = 5

    types_row = df.loc[hdr-1, 1:].tolist()
    cats_row  = df.loc[hdr,   1:].tolist()

    rf_types = {}
    rf_cats = {}
    last_type = None
    for idx, t in enumerate(types_row, start=1):
        if pd.notna(t):
            last_type = clean_label_keep_units(t)
        rf_types[idx] = last_type
        cat = cats_row[idx-1]
        rf_cats[idx] = clean_label_keep_units(cat) if pd.notna(cat) else None

    rows = df.iloc[hdr+1:].reset_index(drop=True)
    data_rows, denom_rows = [], []
    current_group = None
    current_subgroup = None
    in_group = False

    for _, row in rows.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label = clean_label_keep_units(str(first))
        if not label or is_footer_or_note(label):
            continue

        if row.iloc[1:].isnull().all():
            if not in_group:
                current_group = label
                current_subgroup = None
                in_group = True
            else:
                current_subgroup = label
            continue

        if label.lower().startswith("total ") and "results" in label.lower():
            scope = classify_denom(label)
            for c in range(1, df.shape[1]):
                val, star = parse_value(row.iloc[c])
                if val is None:
                    continue
                denom_rows.append({
                    "risk_factor_type": rf_types.get(c),
                    "risk_factor_category": rf_cats.get(c),
                    "group": current_group,
                    "subgroup": current_subgroup,
                    "test_scope": scope,
                    "denominator_000": val,
                    "starred_flag": star
                })
            continue

        if label.lower().startswith("total persons"):
            continue

        for c in range(1, df.shape[1]):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            data_rows.append({
                "risk_factor_type": rf_types.get(c),
                "risk_factor_category": rf_cats.get(c),
                "group": current_group,
                "subgroup": current_subgroup,
                "category": label,
                "count_000": val,
                "starred_flag": star
            })

    return pd.DataFrame(data_rows), pd.DataFrame(denom_rows)

# ----------------------------------------------------------------------
# Table 25.1 (NHMSDC25): Nutrient biomarkers (Females by age groups)
# ----------------------------------------------------------------------
def process_nutrient_biomarkers_females(xlsx_path):
    """Return tidy rows with mean/median/IQR counts & denominators by age."""
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 25.1" in s.lower())
    df = xl.parse(sheet, header=None)

    hdr = find_header_row(df)
    if hdr is None:
        hdr = 5
    age_cols = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    age_idx = list(range(1, 1 + len(age_cols)))
    rows = df.iloc[hdr+1:].reset_index(drop=True)

    out = []
    current_group = None

    for _, row in rows.iterrows():
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
                out.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                            "measure": "mean", "value": val, "starred_flag": star})
            continue

        if text.startswith("Median "):
            indicator = text.replace("Median ", "", 1)
            for c, age in zip(age_idx, age_cols):
                val, star = parse_value(row.iloc[c])
                out.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                            "measure": "median", "value": val, "starred_flag": star})
            continue

        if text.startswith("Interquartile range "):
            indicator = text.replace("Interquartile range ", "", 1)
            for c, age in zip(age_idx, age_cols):
                lo, hi = parse_iqr(row.iloc[c])
                if lo is not None:
                    out.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                                "measure": "iqr_low", "value": lo, "starred_flag": 0})
                    out.append({"age_group": age, "indicator": f"{current_group} – {indicator}",
                                "measure": "iqr_high", "value": hi, "starred_flag": 0})
            continue

        if text.lower().startswith("total ") and "results" in text.lower():
            denom_type = text.replace("Total ", "", 1).replace(" results", "").strip()
            for c, age in zip(age_idx, age_cols):
                val, star = parse_value(row.iloc[c])
                out.append({"age_group": age, "indicator": f"{current_group} – denominator",
                            "measure": denom_type, "value": val, "starred_flag": star})
            continue

        # category counts
        for c, age in zip(age_idx, age_cols):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            out.append({"age_group": age, "indicator": f"{current_group} – {text}",
                        "measure": "count_000", "value": val, "starred_flag": star})

    return pd.DataFrame(out)

# ----------------------------------------------------------------------
# Table 27.1 (NHMSDC27): Nutrient biomarkers (trends by year)
# ----------------------------------------------------------------------
def _header_and_years_for_27(df):
    """
    Robustly locate the row that actually contains the year labels for Table 27.1.
    Returns: (header_row_index, years_list)
    """
    def years_from_row(r):
        vals = [clean_label_keep_units(x) for x in df.loc[r, 1:].dropna().tolist()]
        return vals

    # 1) Try the row find_header_row thinks is right, but VERIFY it really has years in cols 1+
    hdr = find_header_row(df)
    tried = set()
    if hdr is not None:
        yrs = years_from_row(hdr)
        tried.add(hdr)
        if yrs and any("2011" in str(y) for y in yrs) and any("2022" in str(y) for y in yrs):
            return hdr, yrs

    # 2) Try common header rows seen in ABS cubes
    for guess in (4, 5, 6):
        if guess in tried:
            continue
        yrs = years_from_row(guess)
        if yrs and any("2011" in str(y) for y in yrs) and any("2022" in str(y) for y in yrs):
            return guess, yrs

    # 3) Last resort: scan the first 12 rows for any row with >=2 non-NA value cells and both years
    for guess in range(0, min(12, len(df))):
        yrs = years_from_row(guess)
        if yrs and any("2011" in str(y) for y in yrs) and any("2022" in str(y) for y in yrs):
            return guess, yrs

    raise ValueError("Could not locate the year header row for Table 27.1.")


def process_nutrient_biomarkers_years(xlsx_path):
    """
    Table 27.1 – Nutrient biomarkers (trends by year).
    Outputs one tidy row per (year × indicator/measure), including:
      - mean, median, IQR low/high
      - category counts (in '000)
      - denominators from 'Total ... results' rows
    """
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 27.1" in s.lower())
    df = xl.parse(sheet, header=None)

    # ✅ Robust header detection that ensures years are in cols 1+
    hdr, years = _header_and_years_for_27(df)
    year_idx = list(range(1, 1 + len(years)))
    rows = df.iloc[hdr+1:].reset_index(drop=True)

    out = []
    current_group = None  # e.g., 'Folate', 'Vitamin B12', 'Iron', 'Iodine(d)', 'Vitamin D'

    for _, row in rows.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue

        text = clean_label_keep_units(str(first))
        if not text or is_footer_or_note(text):
            continue

        # Group (nutrient) header – only col 0 has text, year columns empty
        if row.iloc[1:].isnull().all():
            current_group = text
            continue

        # Means
        if text.startswith("Mean "):
            indicator = text.replace("Mean ", "", 1)
            for c, yr in zip(year_idx, years):
                val, star = parse_value(row.iloc[c])
                out.append({
                    "year": yr,
                    "indicator": f"{current_group} – {indicator}",
                    "measure": "mean",
                    "value": val,
                    "starred_flag": star
                })
            continue

        # Medians
        if text.startswith("Median "):
            indicator = text.replace("Median ", "", 1)
            for c, yr in zip(year_idx, years):
                val, star = parse_value(row.iloc[c])
                out.append({
                    "year": yr,
                    "indicator": f"{current_group} – {indicator}",
                    "measure": "median",
                    "value": val,
                    "starred_flag": star
                })
            continue

        # IQR
        if text.startswith("Interquartile range "):
            indicator = text.replace("Interquartile range ", "", 1)
            for c, yr in zip(year_idx, years):
                lo, hi = parse_iqr(row.iloc[c])
                if lo is not None:
                    out.append({
                        "year": yr,
                        "indicator": f"{current_group} – {indicator}",
                        "measure": "iqr_low",
                        "value": lo,
                        "starred_flag": 0
                    })
                    out.append({
                        "year": yr,
                        "indicator": f"{current_group} – {indicator}",
                        "measure": "iqr_high",
                        "value": hi,
                        "starred_flag": 0
                    })
            continue

        # Denominators – 'Total ... results' (keep), but skip 'No ... test results'
        lcl = text.lower()
        if lcl.startswith("total ") and " results" in lcl:
            denom_type = text.replace("Total ", "", 1).replace(" results", "").strip()
            for c, yr in zip(year_idx, years):
                val, star = parse_value(row.iloc[c])
                out.append({
                    "year": yr,
                    "indicator": f"{current_group} – denominator",
                    "measure": denom_type,
                    "value": val,
                    "starred_flag": star
                })
            continue

        # ❌ Skip "No ... test results" lines (not an indicator)
        if lcl.startswith("no ") and "test results" in lcl:
            continue

        # 'Total persons, 18 years and over' is not an indicator – skip
        if lcl.startswith("total persons"):
            continue

        # Category counts (e.g., iodine status buckets)
        for c, yr in zip(year_idx, years):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            out.append({
                "year": yr,
                "indicator": f"{current_group} – {text}",
                "measure": "count_000",
                "value": val,
                "starred_flag": star
            })

    return pd.DataFrame(out)


# ----------------------------------------------------------------------
# Table 22.1 (NHMSDC22): Vitamin D status by season and state/territory
# ----------------------------------------------------------------------
def process_vitaminD_season_state(xlsx_path):
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 22.1" in s.lower())
    df = xl.parse(sheet, header=None)

    hdr = find_header_row(df, contains=["nsw", "act"])  # states header row
    if hdr is None:
        hdr = 4
    states = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    state_idx = list(range(1, 1 + len(states)))
    rows = df.iloc[hdr+1:].reset_index(drop=True)

    def classify_vitd(text):
        t = text.lower()
        if "deficient" in t:
            return "deficient"
        if "insufficient" in t:
            return "insufficient"
        if "sufficient" in t or "adequate" in t:
            return "sufficient"
        return None

    out = []
    current_season = None

    for _, row in rows.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label = clean_label_keep_units(str(first))
        if not label or is_footer_or_note(label):
            continue

        if row.iloc[1:].isnull().all():
            current_season = label  # e.g., Autumn, Winter, …
            continue

        if label.lower().startswith("total ") and "results" in label.lower():
            # denominator
            for c, state in zip(state_idx, states):
                val, star = parse_value(row.iloc[c])
                out.append({
                    "season": current_season, "state": state,
                    "measure": "denominator_blood_test", "value": val, "starred_flag": star
                })
            continue

        if label.lower().startswith("total persons"):
            continue

        status = classify_vitd(label)
        if status is None:
            continue

        for c, state in zip(state_idx, states):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            out.append({
                "season": current_season, "state": state,
                "vitaminD_status": status, "measure": "count_000",
                "value": val, "starred_flag": star
            })

    return pd.DataFrame(out)

# ---------------------------------------------------------
# Table 8.1 (NHMSDC08): Kidney biomarkers by sex (Persons)
# ---------------------------------------------------------
def process_kidney_biomarkers(xlsx_path):
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 8.1" in s.lower())
    df = xl.parse(sheet, header=None)

    hdr = find_header_row(df, contains=["males", "females"])
    if hdr is None:
        hdr = 4
    sexes = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    sex_idx = list(range(1, 1 + len(sexes)))
    rows = df.iloc[hdr+1:].reset_index(drop=True)

    out = []
    current_group = None
    sub_group = None

    for _, row in rows.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label = clean_label_keep_units(str(first))
        if not label or is_footer_or_note(label):
            continue

        if row.iloc[1:].isnull().all():
            current_group = label
            sub_group = None
            continue

        # subgroups like eGFR / Albumin Creatinine Ratio / Indicators…
        if label.lower().startswith(("egfr", "albumin", "indicators")):
            sub_group = label
            continue

        # denominators
        if label.lower().startswith("total ") and "results" in label.lower():
            denom_type = label.replace("Total ", "", 1).replace("results", "").strip()
            for c, sex in zip(sex_idx, sexes):
                val, star = parse_value(row.iloc[c])
                out.append({"sex": sex, "indicator": f"{current_group} – denominator",
                            "measure": denom_type, "value": val, "starred_flag": star})
            continue

        if label.lower().startswith("total"):
            continue

        # category counts
        for c, sex in zip(sex_idx, sexes):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            out.append({"sex": sex,
                        "indicator": f"{current_group} – {sub_group} – {label}",
                        "measure": "count_000", "value": val, "starred_flag": star})

    return pd.DataFrame(out)

# -------------------------------------------------------
# Table 9.1 (NHMSDC09): Liver biomarkers by sex (ALT/AST)
# -------------------------------------------------------
def process_liver_biomarkers(xlsx_path):
    xl = pd.ExcelFile(xlsx_path)
    sheet = next(s for s in xl.sheet_names if "table 9.1" in s.lower())
    df = xl.parse(sheet, header=None)

    hdr = find_header_row(df, contains=["males", "females"])
    if hdr is None:
        hdr = 4
    sexes = [clean_label_keep_units(x) for x in df.loc[hdr, 1:].dropna().tolist()]
    sex_idx = list(range(1, 1 + len(sexes)))
    rows = df.iloc[hdr+1:].reset_index(drop=True)

    out = []
    current_group = None
    sub_group = None

    for _, row in rows.iterrows():
        first = row.iloc[0]
        if pd.isna(first):
            continue
        label = clean_label_keep_units(str(first))
        if not label or is_footer_or_note(label):
            continue

        if row.iloc[1:].isnull().all():
            current_group = label
            sub_group = None
            continue

        lt = label.lower()
        if "alt (u/l) range" in lt:
            sub_group = "ALT"; continue
        if "ast (u/l) range" in lt:
            sub_group = "AST"; continue
        if "ggt (u/l) range" in lt:
            sub_group = "GGT"; continue

        if lt.startswith("total ") and "results" in lt:
            denom_type = label.replace("Total ", "", 1).replace("results", "").strip()
            for c, sex in zip(sex_idx, sexes):
                val, star = parse_value(row.iloc[c])
                out.append({"sex": sex, "indicator": f"{current_group} – denominator",
                            "measure": denom_type, "value": val, "starred_flag": star})
            continue

        if lt.startswith("total"):
            continue

        for c, sex in zip(sex_idx, sexes):
            val, star = parse_value(row.iloc[c])
            if val is None:
                continue
            out.append({"sex": sex,
                        "indicator": f"{current_group} – {sub_group} – {label}",
                        "measure": "count_000", "value": val, "starred_flag": star})

    return pd.DataFrame(out)

# ---------------------------------------------------------
# Simple CLI / demo driver
# ---------------------------------------------------------
def _save(df: pd.DataFrame, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)

if __name__ == "__main__":
    # Adjust these paths as needed (run from repo root or the folder with xlsx files)
    base = Path("backend/data_raw")  # or Path("backend/data/raw") etc.

    # Chronic biomarkers (NHMSDC26)
    try:
        c_counts, c_rates, c_den = process_chronic_biomarkers(base / "NHMSDC26.xlsx")
        _save(c_counts, Path("backend/data_clean/chronic_indicators.csv"))
        _save(c_den,    Path("backend/data_clean/chronic_denominators.csv"))
        _save(c_rates,  Path("backend/data_clean/chronic_prevalence.csv"))
        print("Wrote chronic_* CSVs in backend/data_clean/")
    except Exception as e:
        print("Chronic parse failed:", e)

    # Risk factors (NHMSDC10)
    try:
        rf_data, rf_den = process_risk_factors(base / "NHMSDC10.xlsx")
        _save(rf_data, Path("backend/data_clean/riskfactor_indicators.csv"))
        _save(rf_den,  Path("backend/data_clean/riskfactor_denominators.csv"))
        print("Wrote riskfactor_* CSVs in backend/data_clean/")
    except Exception as e:
        print("Risk factors parse failed:", e)

    # Nutrients (NHMSDC25, females)
    try:
        nf = process_nutrient_biomarkers_females(base / "NHMSDC25.xlsx")
        _save(nf, Path("backend/data_clean/nutrient_females.csv"))
        print("Wrote nutrient_females.csv in backend/data_clean/")
    except Exception as e:
        print("Nutrient females parse failed:", e)

    # Nutrients by year (NHMSDC27)
    try:
        ny = process_nutrient_biomarkers_years(base / "NHMSDC27.xlsx")
        _save(ny, Path("backend/data_clean/nutrient_years.csv"))
        print("Wrote nutrient_years.csv in backend/data_clean/")
    except Exception as e:
        print("Nutrient years parse failed:", e)

    # Vitamin D by season/state (NHMSDC22)
    try:
        vds = process_vitaminD_season_state(base / "NHMSDC22.xlsx")
        _save(vds, Path("backend/data_clean/vitaminD_season_state.csv"))
        print("Wrote vitaminD_season_state.csv in backend/data_clean/")
    except Exception as e:
        print("Vitamin D parse failed:", e)

    # Kidney (NHMSDC08)
    try:
        k8 = process_kidney_biomarkers(base / "NHMSDC08.xlsx")
        _save(k8, Path("backend/data_clean/kidney_biomarkers.csv"))
        print("Wrote kidney_biomarkers.csv in backend/data_clean/")
    except Exception as e:
        print("Kidney parse failed:", e)

    # Liver (NHMSDC09)
    try:
        l9 = process_liver_biomarkers(base / "NHMSDC09.xlsx")
        _save(l9, Path("backend/data_clean/liver_biomarkers.csv"))
        print("Wrote liver_biomarkers.csv in backend/data_clean/")
    except Exception as e:
        print("Liver parse failed:", e)
