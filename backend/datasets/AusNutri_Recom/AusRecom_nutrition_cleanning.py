import pandas as pd

def split_by_gender(filepath, sheet_name="Table1.1"):
    #split by gender
    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
    df = df.iloc[:151, :]  #dump all use less columns
    genders = ["Males", "Females", "Persons"]
    sections = {}
    current_gender = None
    start_idx = None

    for i, row in df.iterrows():
        row_values = row.astype(str).tolist()
        for g in genders:
            if any(g in str(cell) for cell in row_values):
                if current_gender is not None and start_idx is not None:
                    sections[current_gender] = df.iloc[start_idx:i].reset_index(drop=True)
                current_gender = g
                start_idx = i + 1
                break

    if current_gender is not None and start_idx is not None:
        sections[current_gender] = df.iloc[start_idx:].reset_index(drop=True)

    return sections


def add_category_column(sections, genders):
    #add category by the data
    new_sections = {}
    for gender in genders:
        df = sections[gender].copy()
        category = None
        categories = []
        for _, row in df.iterrows():
            if pd.isna(row[1]) or str(row[1]).strip() == "":
                category = str(row[0]).strip()
            categories.append(category)
        df["Category"] = categories
        new_sections[gender] = df
    return new_sections


def apply_colnames(sections, genders):
    #the name is from front 
    col_names_fixed = [
        "Nutrient", "Unit", "2-3", "4-8", "9-13", "14-18", "19-30", "31-50", "51-70",
        "71_and_over", "2-18", "19_and_over", "Total_2_years_and_over"
    ]
    for g in genders:
        df = sections[g].copy()
        n = len(col_names_fixed)
        df.columns = col_names_fixed + list(df.columns[n:])  # name 
        sections[g] = df
    return sections


def merge_sections(sections, genders):
    #concat all sections with gender
    merged_list = []
    for g in genders:
        df = sections[g].copy()
        df["Gender"] = g
        merged_list.append(df)
    merged_df = pd.concat(merged_list, ignore_index=True)
    return merged_df

if __name__ == "__main__":
    file_path = "Table 1 Mean daily energy and nutrient intake.xls"
    genders = ["Males", "Females", "Persons"]

    # 1. spl;it by gender
    sections = split_by_gender(file_path)

    # 2. add Category 
    sections_with_cat = add_category_column(sections, genders)
    for gender in genders:
        for r in range(2):  #Only for energy and moisture
            sections_with_cat[gender].loc[r, "Category"] = sections_with_cat[gender].iloc[r, 0]

    # 3.add column name
    sections_named = apply_colnames(sections_with_cat, genders)

    # 4. concat as one DataFrame
    merged_df = merge_sections(sections_named, genders)
    merged_df = merged_df.dropna()
    
    
    
    
    # 5. output CSV
    merged_df.to_csv("AusRecom_nutrition_cleanning.csv", index=False)