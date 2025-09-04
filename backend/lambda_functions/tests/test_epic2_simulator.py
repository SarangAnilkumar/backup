import os
import json

# Point env to RDS (from backend/loader.yml)
os.environ.setdefault('RDS_HOST', 'healthylife-rds.c54oswsus7c6.ap-southeast-2.rds.amazonaws.com')
os.environ.setdefault('RDS_PORT', '3306')
os.environ.setdefault('RDS_USER', 'admin')
os.environ.setdefault('RDS_PASSWORD', 'healthylife123')
os.environ.setdefault('RDS_DB', 'healthylife')

from backend.lambda_functions.fetchEpic2SimulatorData import lambda_handler


def run_case(name, payload):
    print(f"\n=== {name} ===")
    event = {"httpMethod": "POST", "body": json.dumps(payload)}
    resp = lambda_handler(event, None)
    print("status:", resp.get('statusCode'))
    if resp.get('statusCode') != 200:
        print("error:", resp.get('body'))
        return False
    data = json.loads(resp['body'])
    # basic shape checks
    assert 'baseline_at_risk_pct' in data
    assert 'results' in data
    for k in ['alcohol_use','tobacco_use','physical_inactivity','overweight_obesity']:
        assert k in data['results']
    return True


def case_baseline_only():
    payload = {
        "sex": "Persons",
        "data_year": 2018,
        "min_age": 25,
        "max_age": 34,
        "top_n": 5,
        # no deltas -> baseline echo
    }
    return run_case("baseline_only", payload)


def case_with_deltas():
    payload = {
        "sex": "Persons",
        "data_year": 2018,
        "min_age": 25,
        "max_age": 34,
        "top_n": 5,
        "deltas": {
            "alcohol_exceeded_delta": 5.0,
            "smoker_daily_delta": 2.0,
            "inactive_not_met_delta": 5.0,
            "overweight_or_obese_delta": 4.0
        }
    }
    ok = run_case("with_deltas", payload)
    if not ok:
        return False
    # additional monotonic check
    resp = lambda_handler({"httpMethod": "POST", "body": json.dumps(payload)}, None)
    data = json.loads(resp['body'])
    for group in data['results'].values():
        for row in group:
            cur = row.get('current_attrib_daly') or 0
            proj = row.get('projected_attrib_daly') or 0
            assert proj <= cur + 1e-6
    return True


if __name__ == '__main__':
    ok1 = case_baseline_only()
    ok2 = case_with_deltas()
    print("\nAll tests ok?", bool(ok1 and ok2))

