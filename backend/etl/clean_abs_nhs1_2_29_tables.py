# clean_abs_nhs_tables.py
import pandas as pd
import numpy as np
import re
import os

STATE_NAME = {
    "NSW":"New South Wales","VIC":"Victoria","QLD":"Queensland","SA":"South Australia",
    "WA":"Western Australia","TAS":"Tasmania","NT":"Northern Territory",
    "ACT":"Australian Capital Territory","AUS":"Australia",
}

def clean_numeric(x):
    s = str(x).strip()
    if s.lower() in ("na", "nan", "", "none", ". ."):
        return None
    s = re.sub(r"[^0-9.\-]", "", s)
    try:
        return float(s) if s != "" else None
    except Exception:
        return None

def norm_state_header(s):
    s = str(s).strip()
    mapping = {"Vic.":"VIC","Qld":"QLD","Tas.":"TAS","NSW":"NSW","SA":"SA","WA":"WA","NT":"NT","ACT":"ACT","Australia":"AUS"}
    return mapping.get(s, s)

# ---------- Table 2 (states) ----------
def parse_table2_proportions(xlsx_path):
    df = pd.read_excel(xlsx_path, sheet_name="Table 2.3_Proportions", header=None)
    states1 = [norm_state_header(x) for x in df.iloc[5, 1:10].tolist()]   # “Proportion” block
    age_scope, current_indicator = None, None
    out = []
    for i in range(8, df.shape[0]):
        label = str(df.iloc[i,0]).strip()
        if label.startswith("Total persons"):
            if "18 years and over" in label: age_scope = "All 18+"
            elif "all ages" in label:        age_scope = "All ages"
            else:                             age_scope = ""
            continue
        if label and df.iloc[i,1:18].isna().all():
            current_indicator = label; continue
        vals = df.iloc[i, 1:10].tolist()
        if all((str(v).strip().lower() in ("", "na", "nan") for v in vals)) or current_indicator is None:
            continue

        ci = (current_indicator or "").lower()
        if   ci.startswith("body mass index"):          norm_ind = "Body Mass Index (BMI)"
        elif "waist circumference" in ci:               norm_ind = "Waist circumference risk"
        elif "alcohol guid" in ci or "alcohol cons" in ci: norm_ind = "Alcohol consumption"
        elif "smoker status" in ci:                     norm_ind = "Smoker status"
        elif "daily consumption of fruit" in ci:        norm_ind = "Fruit/vegetable consumption"
        elif "2014 physical activity" in ci:            norm_ind = "Physical activity (2014 guidelines)"
        else:                                           continue

        for st, v in zip(states1, vals):
            val = clean_numeric(v)
            if val is None: continue
            out.append({
                "state_code": st,
                "state_name": STATE_NAME.get(st, st),
                "sex": "Persons",
                "age_group": age_scope or "",
                "indicator": norm_ind,
                "category": label,
                "survey_period": "2022–24",
                "value_pct": val,
                "note": "Proportion"
            })
    return pd.DataFrame(out)

# ---------- Table 1 (Australia) ----------
def parse_table1_proportions(xlsx_path):
    df = pd.read_excel(xlsx_path, sheet_name="Table 1.3_Proportions", header=None)
    last_col_idx = None
    for idx in range(df.shape[1]-1, -1, -1):
        if re.search(r"20\d{2}", str(df.iloc[5, idx])): last_col_idx = idx; break
    if last_col_idx is None: last_col_idx = df.shape[1]-1

    current_indicator, out = None, []
    for i in range(8, df.shape[0]):
        label = str(df.iloc[i,0]).strip()
        if not label or label.lower()=="nan": continue
        if df.iloc[i,1:last_col_idx].isna().all():
            current_indicator = label; continue
        val = clean_numeric(df.iloc[i, last_col_idx])
        if val is None or current_indicator is None: continue

        ci = current_indicator.lower()
        if   ci.startswith("body mass index"):          norm_ind = "Body Mass Index (BMI)"
        elif "waist circumference" in ci:               norm_ind = "Waist circumference risk"
        elif "alcohol " in ci:                          norm_ind = "Alcohol consumption"
        elif "smoker" in ci:                            norm_ind = "Smoker status"
        elif "physical activity" in ci:                 norm_ind = "Physical activity (2014 guidelines)"
        elif "fruit" in ci or "vegetables" in ci:       norm_ind = "Fruit/vegetable consumption"
        else:                                           continue

        out.append({
            "state_code":"AUS","state_name":STATE_NAME["AUS"],
            "sex":"Persons","age_group":"All 18+",
            "indicator":norm_ind,"category":label,
            "survey_period":"2022–24","value_pct":val,"note":"Proportion"
        })
    return pd.DataFrame(out)

# ---------- Table 29 (VIC) – BMI by age & sex ----------
def parse_vic_bmi_by_age(xlsx_path):
    df = pd.read_excel(xlsx_path, sheet_name="Table 8.3_Proportions", header=None)
    header_row = next((i for i in range(df.shape[0]) if str(df.iloc[i,1]).strip().startswith("Age group")), None)
    if header_row is None: return pd.DataFrame()
    age_cols = [(j, str(df.iloc[header_row+1, j]).strip())
                for j in range(df.shape[1]) if re.search(r"\d", str(df.iloc[header_row+1, j]))]
    recs, current_sex, in_bmi = [], None, False
    for i in range(header_row+2, df.shape[0]):
        first = str(df.iloc[i,0]).strip()
        if first in ("Persons","Males","Females"):
            current_sex, in_bmi = first, False; continue
        if current_sex and "Measured Body Mass Index" in first:
            in_bmi = True; continue
        if current_sex and in_bmi:
            if first.startswith("Total ") or first=="" or first.lower()=="nan":
                in_bmi = False; continue
            for col_idx, age_label in age_cols:
                val = clean_numeric(df.iloc[i, col_idx])
                if val is None: continue
                recs.append({
                    "state_code":"VIC","state_name":STATE_NAME["VIC"],
                    "sex": current_sex,
                    "age_group": age_label.replace("years and over","+").replace("years","").strip(),
                    "indicator":"Body Mass Index (BMI)","category":first,
                    "survey_period":"2022–24","value_pct":val,"note":"Proportion"
                })
    return pd.DataFrame(recs)

# ---------- Table 29 (VIC) – Physical activity by age & sex ----------
def parse_vic_physical_activity_by_age(xlsx_path):
    sheets = ["Table 11.3_Proportions Persons","Table 11.7_Proportions Males","Table 11.11_Proportions Females"]
    out = []
    for sheet in sheets:
        try:
            df = pd.read_excel(xlsx_path, sheet_name=sheet, header=None)
        except Exception:
            continue
        header_row = next((i for i in range(df.shape[0]) if any(str(x).strip().startswith("Age group") for x in df.iloc[i,:])), None)
        if header_row is None: continue
        age_cols = [(j, str(df.iloc[header_row+1, j]).strip())
                    for j in range(df.shape[1]) if re.search(r"\d", str(df.iloc[header_row+1, j]))]
        sex = "Persons" if "Persons" in sheet else ("Males" if "Males" in sheet else "Females")
        in_section = False
        for i in range(header_row+2, df.shape[0]):
            first = str(df.iloc[i,0]).strip()
            if first.startswith("2014 physical activity"):
                in_section = True; continue
            if in_section:
                if first.startswith("Total ") or first=="" or first.lower()=="nan": break
                for col_idx, age_label in age_cols:
                    val = clean_numeric(df.iloc[i, col_idx])
                    if val is None: continue
                    out.append({
                        "state_code":"VIC","state_name":STATE_NAME["VIC"],
                        "sex":sex,
                        "age_group": age_label.replace("years and over","+").replace("years","").strip(),
                        "indicator":"Physical activity (2014 guidelines)","category":first,
                        "survey_period":"2022–24","value_pct":val,"note":"Proportion"
                    })
    return pd.DataFrame(out)

def main():
    in_t1  = "backend/data_raw/NHSDC01.xlsx"
    in_t2  = "backend/data_raw/NHSDC02.xlsx"
    in_vic = "backend/data_raw/NHSDC29.xlsx"
    out_dir = "backend/data_clean"
    os.makedirs(out_dir, exist_ok=True)

    # Parse
    df_t1  = parse_table1_proportions(in_t1) if os.path.exists(in_t1) else pd.DataFrame()
    df_t2  = parse_table2_proportions(in_t2) if os.path.exists(in_t2) else pd.DataFrame()
    df_bmi = parse_vic_bmi_by_age(in_vic)    if os.path.exists(in_vic) else pd.DataFrame()
    df_pa  = parse_vic_physical_activity_by_age(in_vic) if os.path.exists(in_vic) else pd.DataFrame()

    # Write CSVs
    if not df_t1.empty:
        df_t1.to_csv(os.path.join(out_dir, "nhs_national_table1_proportions_2022.csv"), index=False)
    if not df_t2.empty:
        df_t2.to_csv(os.path.join(out_dir, "nhs_state_table2_proportions_2022.csv"), index=False)
    if not df_bmi.empty:
        df_bmi.to_csv(os.path.join(out_dir, "nhs_vic_bmi_by_age_2022.csv"), index=False)
    if not df_pa.empty:
        df_pa.to_csv(os.path.join(out_dir, "nhs_vic_physical_activity_by_age_2022.csv"), index=False)

    # Simple status messages for convenience
    wrote_any = False
    for name, df in {
        "table1": df_t1, "table2": df_t2, "vic_bmi": df_bmi, "vic_pa": df_pa
    }.items():
        if not df.empty:
            wrote_any = True
            print(f"✔ wrote {name} to {out_dir}")
        else:
            print(f"⚠ no data parsed for {name} (missing file or no rows)")
    if not wrote_any:
        print("No outputs written. Check your input file paths.")

if __name__ == "__main__":
    main()