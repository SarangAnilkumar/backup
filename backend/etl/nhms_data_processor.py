import pandas as pd
import numpy as np
import re
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class BiomarkerRecord:
    """Data class for structured biomarker records"""
    survey_period: str
    biomarker_category: str
    biomarker_type: str
    biomarker_subtype: str
    measurement_status: str
    age_group: str
    gender: str
    estimate_thousands: Optional[float]
    relative_standard_error: Optional[float]
    proportion: Optional[float]
    age_standardized_proportion: Optional[float]
    margin_of_error: Optional[float]
    sample_type: str
    normal_range: str
    units: str
    population_base: str

class NHMSDataProcessor:
    """
    Processes NHMS biomarker data from semi-structured format to fully structured format
    for relational database storage
    """
    
    def __init__(self):
        self.biomarker_definitions = self._create_biomarker_definitions()
        self.structured_records = []
        
    def _create_biomarker_definitions(self) -> Dict:
        """Create standardized biomarker definitions"""
        return {
            'total_cholesterol': {
                'category': 'cardiovascular',
                'normal_range': '<5.5 mmol/L',
                'abnormal_range': '≥5.5 mmol/L',
                'units': 'mmol/L',
                'sample_type': 'blood_test'
            },
            'hdl_cholesterol': {
                'category': 'cardiovascular',
                'normal_range': 'Age/sex specific',
                'abnormal_range': 'Age/sex specific',
                'units': 'mmol/L',
                'sample_type': 'blood_test'
            },
            'ldl_cholesterol': {
                'category': 'cardiovascular',
                'normal_range': '<3.5 mmol/L',
                'abnormal_range': '≥3.5 mmol/L',
                'units': 'mmol/L',
                'sample_type': 'fasting_blood_test'
            },
            'triglycerides': {
                'category': 'cardiovascular',
                'normal_range': '<2.0 mmol/L',
                'abnormal_range': '≥2.0 mmol/L',
                'units': 'mmol/L',
                'sample_type': 'fasting_blood_test'
            },
            'dyslipidaemia': {
                'category': 'cardiovascular',
                'normal_range': 'Composite normal',
                'abnormal_range': 'Has dyslipidaemia',
                'units': 'composite',
                'sample_type': 'fasting_blood_test'
            },
            'fasting_plasma_glucose': {
                'category': 'diabetes',
                'normal_range': 'Normal glucose',
                'abnormal_range': 'Has diabetes',
                'units': 'mmol/L',
                'sample_type': 'fasting_blood_test'
            },
            'hba1c': {
                'category': 'diabetes',
                'normal_range': 'Normal',
                'abnormal_range': 'Has diabetes/high risk',
                'units': '%',
                'sample_type': 'blood_test'
            },
            'egfr': {
                'category': 'kidney',
                'normal_range': '≥60 mL/min/1.73 m²',
                'abnormal_range': '<60 mL/min/1.73 m²',
                'units': 'mL/min/1.73 m²',
                'sample_type': 'blood_test'
            },
            'albumin_creatinine_ratio': {
                'category': 'kidney',
                'normal_range': 'No albuminuria',
                'abnormal_range': 'Presence of albuminuria',
                'units': 'mg/mmol',
                'sample_type': 'urine_test'
            },
            'chronic_kidney_disease': {
                'category': 'kidney',
                'normal_range': 'No indicators',
                'abnormal_range': 'Stages 1-5',
                'units': 'composite',
                'sample_type': 'blood_urine_combined'
            },
            'haemoglobin': {
                'category': 'anaemia',
                'normal_range': 'Age/sex specific',
                'abnormal_range': 'Age/sex specific',
                'units': 'g/L',
                'sample_type': 'blood_test'
            }
        }
    
    def read_excel_file(self, file_path: str) -> Dict[str, pd.DataFrame]:
        """Read all sheets from the Excel file"""
        try:
            excel_data = pd.read_excel(file_path, sheet_name=None, header=None)
            logger.info(f"Successfully read Excel file with {len(excel_data)} sheets")
            return excel_data
        except Exception as e:
            logger.error(f"Error reading Excel file: {e}")
            raise
    
    def clean_numeric_value(self, value) -> Optional[float]:
        """Clean and convert numeric values, handling special cases"""
        if pd.isna(value) or value == '':
            return None
        
        # Handle string values
        if isinstance(value, str):
            # Remove asterisks and special characters
            cleaned = re.sub(r'[*]', '', str(value).strip())
            # Handle ranges or special notations
            if '–' in cleaned or '-' in cleaned:
                return None  # Skip range values for now
            try:
                return float(cleaned)
            except ValueError:
                return None
        
        return float(value) if not pd.isna(value) else None
    
    def extract_biomarker_data(self, df: pd.DataFrame, table_type: str, survey_periods: List[str]) -> List[BiomarkerRecord]:
        """Extract biomarker data from a specific table"""
        records = []
        current_category = ''
        current_biomarker = ''
        
        # Skip header rows and find data start
        data_start_row = 0
        for idx, row in df.iterrows():
            if any(period in str(row.iloc[0]) for period in survey_periods if pd.notna(row.iloc[0])):
                data_start_row = idx + 1
                break
        
        for idx, row in df.iloc[data_start_row:].iterrows():
            if pd.isna(row.iloc[0]) or row.iloc[0] == '':
                continue
                
            row_text = str(row.iloc[0]).strip()
            
            # Identify category sections
            if any(keyword in row_text.lower() for keyword in ['cardiovascular', 'diabetes', 'kidney', 'anaemia']):
                if 'cardiovascular' in row_text.lower():
                    current_category = 'cardiovascular'
                elif 'diabetes' in row_text.lower():
                    current_category = 'diabetes'
                elif 'kidney' in row_text.lower():
                    current_category = 'kidney'
                elif 'anaemia' in row_text.lower():
                    current_category = 'anaemia'
                continue
            
            # Identify biomarker types
            if any(biomarker in row_text.lower() for biomarker in ['cholesterol', 'glucose', 'triglycerides', 'dyslipidaemia', 'egfr', 'albumin', 'haemoglobin', 'hba1c']):
                if 'total cholesterol' in row_text.lower():
                    current_biomarker = 'total_cholesterol'
                elif 'hdl' in row_text.lower():
                    current_biomarker = 'hdl_cholesterol'
                elif 'ldl' in row_text.lower():
                    current_biomarker = 'ldl_cholesterol'
                elif 'triglycerides' in row_text.lower():
                    current_biomarker = 'triglycerides'
                elif 'dyslipidaemia' in row_text.lower():
                    current_biomarker = 'dyslipidaemia'
                elif 'fasting plasma glucose' in row_text.lower():
                    current_biomarker = 'fasting_plasma_glucose'
                elif 'hba1c' in row_text.lower():
                    current_biomarker = 'hba1c'
                elif 'egfr' in row_text.lower() or 'filtration rate' in row_text.lower():
                    current_biomarker = 'egfr'
                elif 'albumin' in row_text.lower() and 'creatinine' in row_text.lower():
                    current_biomarker = 'albumin_creatinine_ratio'
                elif 'chronic kidney disease' in row_text.lower():
                    current_biomarker = 'chronic_kidney_disease'
                elif 'haemoglobin' in row_text.lower():
                    current_biomarker = 'haemoglobin'
                continue
            
            # Extract measurement status and values
            if current_category and current_biomarker and row_text not in ['', 'OFFICIAL: Census and Statistics Act#']:
                measurement_status = self._determine_measurement_status(row_text)
                
                if measurement_status:
                    # Extract values for each survey period
                    for period_idx, period in enumerate(survey_periods):
                        col_offset = period_idx + 1  # Assuming data starts from column 1
                        
                        if table_type == 'estimates':
                            estimate = self.clean_numeric_value(row.iloc[col_offset] if col_offset < len(row) else None)
                            record = BiomarkerRecord(
                                survey_period=period,
                                biomarker_category=current_category,
                                biomarker_type=current_biomarker,
                                biomarker_subtype=self._get_biomarker_subtype(current_biomarker, measurement_status),
                                measurement_status=measurement_status,
                                age_group='18_years_and_over',
                                gender='persons',
                                estimate_thousands=estimate,
                                relative_standard_error=None,
                                proportion=None,
                                age_standardized_proportion=None,
                                margin_of_error=None,
                                sample_type=self.biomarker_definitions.get(current_biomarker, {}).get('sample_type', 'unknown'),
                                normal_range=self.biomarker_definitions.get(current_biomarker, {}).get('normal_range', ''),
                                units=self.biomarker_definitions.get(current_biomarker, {}).get('units', ''),
                                population_base='australian_adults'
                            )
                            records.append(record)
        
        return records
    
    def _determine_measurement_status(self, text: str) -> Optional[str]:
        """Determine measurement status from row text"""
        text_lower = text.lower()
        
        if 'normal' in text_lower and '(' in text:
            return 'normal'
        elif 'abnormal' in text_lower and '(' in text:
            return 'abnormal'
        elif 'has diabetes' in text_lower:
            return 'has_diabetes'
        elif 'known diabetes' in text_lower:
            return 'known_diabetes'
        elif 'newly diagnosed' in text_lower:
            return 'newly_diagnosed_diabetes'
        elif 'does not have diabetes' in text_lower:
            return 'no_diabetes'
        elif 'high risk' in text_lower:
            return 'high_risk_diabetes'
        elif 'impaired fasting' in text_lower:
            return 'impaired_fasting_glucose'
        elif 'stage 1' in text_lower:
            return 'ckd_stage_1'
        elif 'stage 2' in text_lower:
            return 'ckd_stage_2'
        elif 'stage 3a' in text_lower:
            return 'ckd_stage_3a'
        elif 'stage 3b' in text_lower:
            return 'ckd_stage_3b'
        elif 'stages 4-5' in text_lower or 'stage 4' in text_lower or 'stage 5' in text_lower:
            return 'ckd_stage_4_5'
        elif 'no indicators' in text_lower:
            return 'no_ckd_indicators'
        elif 'indicators of chronic kidney disease' in text_lower:
            return 'has_ckd_indicators'
        elif 'presence of albuminuria' in text_lower:
            return 'albuminuria_present'
        elif 'no presence of albuminuria' in text_lower:
            return 'no_albuminuria'
        elif 'does not have dyslipidaemia' in text_lower:
            return 'no_dyslipidaemia'
        elif 'has dyslipidaemia' in text_lower:
            return 'has_dyslipidaemia'
        
        return None
    
    def _get_biomarker_subtype(self, biomarker_type: str, measurement_status: str) -> str:
        """Get biomarker subtype based on type and status"""
        if 'diabetes' in measurement_status:
            if 'known' in measurement_status:
                return 'known_diabetes'
            elif 'newly' in measurement_status:
                return 'newly_diagnosed'
            else:
                return 'total_diabetes'
        elif 'ckd_stage' in measurement_status:
            return measurement_status.replace('ckd_', '')
        elif measurement_status in ['normal', 'abnormal']:
            return measurement_status
        else:
            return 'composite'
    
    def process_all_tables(self, excel_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Process all tables and combine into structured format"""
        all_records = []
        survey_periods = ['2011–12', '2022–24']
        
        for sheet_name, df in excel_data.items():
            logger.info(f"Processing sheet: {sheet_name}")
            
            if 'Table 26.1' in sheet_name:
                # Estimates table
                records = self.extract_biomarker_data(df, 'estimates', survey_periods)
                all_records.extend(records)
            elif 'Table 26.2' in sheet_name:
                # RSE table - could be processed separately if needed
                continue
            elif 'Table 26.3' in sheet_name:
                # Proportions table - could be processed separately if needed
                continue
            elif 'Table 26.4' in sheet_name:
                # Margin of error table - could be processed separately if needed
                continue
        
        # Convert to DataFrame
        if all_records:
            records_dict = []
            for record in all_records:
                records_dict.append({
                    'survey_period': record.survey_period,
                    'biomarker_category': record.biomarker_category,
                    'biomarker_type': record.biomarker_type,
                    'biomarker_subtype': record.biomarker_subtype,
                    'measurement_status': record.measurement_status,
                    'age_group': record.age_group,
                    'gender': record.gender,
                    'estimate_thousands': record.estimate_thousands,
                    'relative_standard_error': record.relative_standard_error,
                    'proportion': record.proportion,
                    'age_standardized_proportion': record.age_standardized_proportion,
                    'margin_of_error': record.margin_of_error,
                    'sample_type': record.sample_type,
                    'normal_range': record.normal_range,
                    'units': record.units,
                    'population_base': record.population_base,
                    'created_at': datetime.now()
                })
            
            structured_df = pd.DataFrame(records_dict)
            logger.info(f"Created structured DataFrame with {len(structured_df)} records")
            return structured_df
        
        return pd.DataFrame()
    
    def create_lookup_tables(self) -> Dict[str, pd.DataFrame]:
        """Create lookup tables for database normalization"""
        
        # Biomarker definitions table
        biomarker_def_records = []
        for biomarker_type, definition in self.biomarker_definitions.items():
            biomarker_def_records.append({
                'biomarker_type': biomarker_type,
                'category': definition['category'],
                'normal_range': definition['normal_range'],
                'abnormal_range': definition.get('abnormal_range', ''),
                'units': definition['units'],
                'sample_type': definition['sample_type'],
                'description': f"{biomarker_type.replace('_', ' ').title()} biomarker"
            })
        
        biomarker_definitions_df = pd.DataFrame(biomarker_def_records)
        
        # Survey periods table
        survey_periods_df = pd.DataFrame([
            {'survey_period': '2011–12', 'start_year': 2011, 'end_year': 2012, 'survey_name': 'Australian Health Survey'},
            {'survey_period': '2022–24', 'start_year': 2022, 'end_year': 2024, 'survey_name': 'National Health Measures Survey'}
        ])
        
        # Sample types table
        sample_types_df = pd.DataFrame([
            {'sample_type': 'blood_test', 'description': 'Blood test results', 'requires_fasting': False},
            {'sample_type': 'fasting_blood_test', 'description': 'Fasting blood test results', 'requires_fasting': True},
            {'sample_type': 'urine_test', 'description': 'Urine test results', 'requires_fasting': False},
            {'sample_type': 'blood_urine_combined', 'description': 'Combined blood and urine test results', 'requires_fasting': False}
        ])
        
        return {
            'biomarker_definitions': biomarker_definitions_df,
            'survey_periods': survey_periods_df,
            'sample_types': sample_types_df
        }
    
    def save_to_csv(self, structured_df: pd.DataFrame, lookup_tables: Dict[str, pd.DataFrame], output_dir: str = './'):
        """Save structured data and lookup tables to CSV files"""
        try:
            # Save main structured data
            structured_df.to_csv(f'{output_dir}nhms_biomarkers_structured.csv', index=False)
            logger.info(f"Saved structured data to {output_dir}nhms_biomarkers_structured.csv")
            
            # Save lookup tables
            for table_name, df in lookup_tables.items():
                df.to_csv(f'{output_dir}{table_name}.csv', index=False)
                logger.info(f"Saved {table_name} to {output_dir}{table_name}.csv")
                
        except Exception as e:
            logger.error(f"Error saving CSV files: {e}")
            raise

def main():
    """Main processing function"""
    
    # Initialize processor
    processor = NHMSDataProcessor()
    
    # Read the Excel file (you'll need to update this path)
    file_path = "backend/data_raw/NHMSDC26.xlsx"  # Update with your actual file path
    
    try:
        # Read Excel data
        excel_data = processor.read_excel_file(file_path)
        
        # Process all tables
        structured_df = processor.process_all_tables(excel_data)
        
        # Create lookup tables
        lookup_tables = processor.create_lookup_tables()
        
        # Save to CSV files
        processor.save_to_csv(structured_df, lookup_tables)
        
        # Print summary statistics
        print("\n=== Processing Summary ===")
        print(f"Total structured records: {len(structured_df)}")
        print(f"Unique biomarker types: {structured_df['biomarker_type'].nunique()}")
        print(f"Survey periods: {structured_df['survey_period'].unique()}")
        print(f"Biomarker categories: {structured_df['biomarker_category'].unique()}")
        
        print("\n=== Sample of Structured Data ===")
        print(structured_df.head())
        
        print("\n=== Lookup Tables Created ===")
        for table_name, df in lookup_tables.items():
            print(f"{table_name}: {len(df)} records")
        
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise

if __name__ == "__main__":
    main()