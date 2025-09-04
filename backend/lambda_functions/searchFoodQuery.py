import os
import json
import pymysql

# Database connection settings from environment variables (accept both DB_* and RDS_* for uniformity)
DB_HOST = os.environ.get("DB_HOST") or os.environ.get("RDS_HOST")
DB_USER = os.environ.get("DB_USER") or os.environ.get("RDS_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD") or os.environ.get("RDS_PASSWORD")
DB_NAME = os.environ.get("DB_NAME") or os.environ.get("RDS_DB")

def lambda_handler(event, context):
    try:
        # Parse request body (for POST requests)
        filters = {}
        if event.get("body"):
            try:
                filters = json.loads(event["body"])
            except json.JSONDecodeError:
                filters = {}

        # Optional filter: food_name
        food_name_filter = filters.get("food_name")

        # Connect to MySQL
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=10
        )

        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            query = """
                SELECT 
                    public_food_key,
                    food_name
                FROM FoodNutrient
            """
            params = []

            if food_name_filter:
                query += " WHERE food_name LIKE %s"
                params.append(f"%{food_name_filter}%")

            query += " GROUP BY public_food_key, food_name ORDER BY food_name"

            cursor.execute(query, params)
            results = cursor.fetchall()

        # CORS-enabled response
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": json.dumps(results, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            "body": json.dumps({"error": str(e)})
        }
