import json
import pymysql
import os

# RDS configuration from Lambda environment variables
RDS_HOST = os.environ['RDS_HOST']
RDS_PORT = int(os.environ.get('RDS_PORT', 3306))
RDS_USER = os.environ['RDS_USER']
RDS_PASSWORD = os.environ['RDS_PASSWORD']
RDS_DB = os.environ['RDS_DB']

# Connect to RDS MySQL
def get_connection():
    return pymysql.connect(
        host=RDS_HOST,
        user=RDS_USER,
        password=RDS_PASSWORD,
        database=RDS_DB,
        port=RDS_PORT,
        cursorclass=pymysql.cursors.DictCursor
    )

# Normalize string for safe comparison
def normalize(s):
    if not s:
        return ""
    return s.strip().replace("?", "-").lower()

def lambda_handler(event, context):
    try:
        # Support both API Gateway and direct Lambda test events
        if 'body' in event:
            data = json.loads(event['body'])
        else:
            data = event

        age = int(data.get('age'))
        gender = data.get('gender', 'Persons')
        alcohol_intake = data.get('alcohol_intake')  # can be 0 or any number
        smoking_status = data.get('smoking_status')  # "Never smoked", "Ex-smoker", "Current smoker"
        smoking_frequency = data.get('smoking_frequency')  # Only used if Current smoker

        response = {}
        conn = get_connection()
        cursor = conn.cursor()

        # --- Get filter_id ---
        cursor.execute("""
            SELECT filter_id 
            FROM age_sex_filter 
            WHERE filter_age_start <= %s
              AND (filter_age_end >= %s OR filter_age_end IS NULL)
              AND filter_sex = %s
            LIMIT 1
        """, (age, age, gender))
        filter_row = cursor.fetchone()
        if not filter_row:
            return {"statusCode": 404, "body": json.dumps({"error": "No matching filter for age/gender"})}
        filter_id = filter_row['filter_id']

        # --- Alcohol statistics ---
        cursor.execute("""
            SELECT alco_fact_status, alco_fact_label, alco_fact_low_bound, alco_fact_up_bound, alco_fact_est_000
            FROM alcohol_fact
            WHERE filter_id = %s
        """, (filter_id,))
        alcohol_rows = cursor.fetchall()

        # Total population for alcohol (all categories)
        cursor.execute("""
            SELECT SUM(alco_fact_est_000) as total_pop
            FROM alcohol_fact
            WHERE filter_id = %s
        """, (filter_id,))
        alcohol_total_population = float(cursor.fetchone()['total_pop'] or 0)

        alcohol_exceeding_population = 0.0
        alcohol_status = "Unknown"

        # --- Handle alcohol intake with explicit mapping ---
        if not alcohol_intake or alcohol_intake <= 0:
            # Never drank or 0
            for row in alcohol_rows:
                if row['alco_fact_label'].lower() == "never consumed alcohol":
                    alcohol_status = row['alco_fact_status']
                    alcohol_exceeding_population = float(row['alco_fact_est_000'])
                    break
        else:
            mapped_label = None
            if 1 <= alcohol_intake < 10:
                mapped_label = "total did not exceed guideline"
            elif 10 <= alcohol_intake <= 12:
                mapped_label = "more than 10 to 12"
            elif 12 < alcohol_intake <= 14:
                mapped_label = "more than 12 to 14"
            elif alcohol_intake > 14:
                mapped_label = "more than 14"

            if mapped_label:
                for row in alcohol_rows:
                    if row['alco_fact_label'].lower() == mapped_label:
                        alcohol_status = row['alco_fact_status']
                        alcohol_exceeding_population = float(row['alco_fact_est_000'])

                        # 🔹 Scale dynamically if in 1–9 range
                        if 1 <= alcohol_intake < 10 and alcohol_exceeding_population:
                            scale_factor = alcohol_intake / 10.0
                            alcohol_exceeding_population = round(alcohol_exceeding_population * scale_factor, 1)
                        break

        alcohol_percentage = round((alcohol_exceeding_population / alcohol_total_population) * 100, 2) if alcohol_total_population else 0
        response['alcohol'] = {
            "total_population": alcohol_total_population,
            "exceeding_population": alcohol_exceeding_population,
            "percentage_exceeding": alcohol_percentage,
            "status": alcohol_status
        }

        # --- Smoking statistics ---
        cursor.execute("""
            SELECT smo_fact_status, smo_fact_frequency, smo_fact_est_000
            FROM smoke_fact
            WHERE filter_id = %s
        """, (filter_id,))
        smoke_rows = cursor.fetchall()

        # Total population for smoking
        cursor.execute("""
            SELECT SUM(smo_fact_est_000) as total_pop
            FROM smoke_fact
            WHERE filter_id = %s
        """, (filter_id,))
        smoke_total_population = float(cursor.fetchone()['total_pop'] or 0)

        smoke_matching_population = 0.0
        smoke_status = "Unknown"

        if smoking_status.lower() in ["never smoked", "ex-smoker"]:
            # For non-current smokers, ignore frequency
            for row in smoke_rows:
                if normalize(row['smo_fact_status']) == normalize(smoking_status):
                    smoke_matching_population = float(row['smo_fact_est_000'])
                    smoke_status = row['smo_fact_status']
                    break
        elif smoking_status.lower() == "current smoker" and smoking_frequency:
            # Only consider frequency if user is current smoker
            input_freq = normalize(smoking_frequency)
            for row in smoke_rows:
                if normalize(row['smo_fact_status']) == "current smoker" and normalize(row['smo_fact_frequency']) == input_freq:
                    smoke_matching_population = float(row['smo_fact_est_000'])
                    smoke_status = row['smo_fact_status'] + f" ({row['smo_fact_frequency']})"
                    break

        smoke_percentage = round((smoke_matching_population / smoke_total_population) * 100, 2) if smoke_total_population else 0
        response['smoking'] = {
            "total_population": smoke_total_population,
            "matching_population": smoke_matching_population,
            "percentage_matching": smoke_percentage,
            "status": smoke_status
        }

        cursor.close()
        conn.close()

        return {"statusCode": 200, "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }, "body": json.dumps(response, default=str)}

    except Exception as e:
        return {"statusCode": 500, "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }, "body": json.dumps({"error": str(e)})}
