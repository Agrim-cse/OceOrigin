"""
OCEORIGIN Flask API
Smart mock backend — realistic physics-inspired responses
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import random, time, math

app = Flask(__name__)
CORS(app)

VESSELS = [
    {"id": "A", "name": "MV Kaveri Star",  "mmsi": "419002481", "type": "Tanker",       "bias": 0.66},
    {"id": "B", "name": "MT Porbandar",    "mmsi": "419118226", "type": "Tanker",       "bias": 0.34},
    {"id": "C", "name": "MV Coromandel",   "mmsi": "419004733", "type": "Bulk carrier", "bias": 0.12},
]

def score_color(v):
    return "red" if v >= 60 else "amber" if v >= 25 else "grey"

# ── Health ──────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "OCEORIGIN API", "version": "0.1.0"})

# ── SAR detections ──────────────────────────────────────────────────
@app.route("/api/detections")
def detections():
    records = [
        {
            "id": "SLK-2447-A",
            "satellite": "Sentinel-1A",
            "date": "2024-11-14T04:22:00Z",
            "area_km2": 4.6,
            "dims": "4.6 × 1.1 km",
            "confidence": 0.91,
            "lat": 13.222,
            "lng": 80.446,
            "type": "Mineral oil",
            "morphology": "Elongated ribbon",
            "orientation_deg": 248,
            "status": "CONFIRMED",
        },
        {
            "id": "SLK-2441-B",
            "satellite": "Sentinel-1B",
            "date": "2024-11-10T03:58:00Z",
            "area_km2": 2.1,
            "dims": "2.1 × 0.8 km",
            "confidence": 0.74,
            "lat": 13.31,
            "lng": 80.39,
            "type": "Probable mineral oil",
            "morphology": "Irregular patch",
            "orientation_deg": 195,
            "status": "PROBABLE",
        },
        {
            "id": "SLK-2439-C",
            "satellite": "Sentinel-1A",
            "date": "2024-11-08T04:10:00Z",
            "area_km2": 0.9,
            "dims": "1.2 × 0.6 km",
            "confidence": 0.56,
            "lat": 13.19,
            "lng": 80.52,
            "type": "Unclassified",
            "morphology": "Diffuse patch",
            "orientation_deg": 310,
            "status": "LOOK-ALIKE",
        },
    ]
    return jsonify(records)

# ── Lagrangian transport simulation ─────────────────────────────────
@app.route("/api/transport/run", methods=["POST"])
def transport_run():
    body = request.get_json(silent=True) or {}
    n_particles = int(body.get("particles", 5000))
    backtrack_h = float(body.get("backtrack_hours", 18))
    n_scenarios = int(body.get("scenarios", 8))

    random.seed(42)
    scenarios_out = []

    for s in range(n_scenarios):
        wind_bias = random.uniform(-0.2, 0.2)
        current_bias = random.uniform(-0.15, 0.15)

        # Simulated probability zones
        zones = [
            {
                "label": "Primary zone",
                "lat": 13.29 + wind_bias * 0.3,
                "lng": 80.40 + current_bias * 0.3,
                "probability": min(0.95, 0.65 + wind_bias * 0.2 + random.random() * 0.1),
            },
            {
                "label": "Secondary zone",
                "lat": 13.25 + wind_bias * 0.2,
                "lng": 80.44 + current_bias * 0.2,
                "probability": min(0.60, 0.38 + random.random() * 0.08),
            },
            {
                "label": "Tertiary zone",
                "lat": 13.31,
                "lng": 80.37,
                "probability": max(0.05, 0.18 - random.random() * 0.06),
            },
        ]
        scenarios_out.append({
            "scenario_id": f"S{s + 1}",
            "wind_bias": round(wind_bias, 3),
            "current_bias": round(current_bias, 3),
            "zones": zones,
        })

    # Aggregate
    agg_zones = [
        {
            "label": "Primary zone",
            "lat": 13.29, "lng": 80.40,
            "probability": round(sum(s["zones"][0]["probability"] for s in scenarios_out) / n_scenarios, 3),
        },
        {
            "label": "Secondary zone",
            "lat": 13.25, "lng": 80.44,
            "probability": round(sum(s["zones"][1]["probability"] for s in scenarios_out) / n_scenarios, 3),
        },
        {
            "label": "Tertiary zone",
            "lat": 13.31, "lng": 80.37,
            "probability": round(sum(s["zones"][2]["probability"] for s in scenarios_out) / n_scenarios, 3),
        },
    ]

    return jsonify({
        "status": "complete",
        "params": {
            "particles": n_particles,
            "backtrack_hours": backtrack_h,
            "scenarios": n_scenarios,
        },
        "scenarios": scenarios_out,
        "aggregate_zones": agg_zones,
    })

# ── Stability test ───────────────────────────────────────────────────
@app.route("/api/attribution/run", methods=["POST"])
def attribution_run():
    body = request.get_json(silent=True) or {}
    n_runs = int(body.get("runs", 8))
    slick_id = body.get("slick_id", "SLK-2447-A")

    random.seed(int(time.time()))
    wins = {v["id"]: 0 for v in VESSELS}
    scenario_log = []

    SCENARIO_LABELS = [
        "Nominal", "+15% wind speed", "-15% wind speed", "+10° wind rotation",
        "ERA5 ±σ current", "T−6h release", "T+6h release", "Diffusion +50%",
    ]

    for i in range(n_runs):
        run_scores = {}
        for v in VESSELS:
            noise = (random.random() - 0.5) * 0.5
            # Physics-inspired: bias toward vessel A for Ennore case
            run_scores[v["id"]] = max(0.0, min(1.0, v["bias"] + noise))
        ranked = sorted(VESSELS, key=lambda v: run_scores[v["id"]], reverse=True)
        wins[ranked[0]["id"]] += 1
        scenario_log.append({
            "run": i + 1,
            "scenario": SCENARIO_LABELS[i % len(SCENARIO_LABELS)],
            "ranking": [v["id"] for v in ranked],
            "scores": {v["id"]: round(run_scores[v["id"]], 3) for v in VESSELS},
            "winner": ranked[0]["id"],
        })

    # AS% = fraction of runs as top candidate
    attribution_scores = {
        v["id"]: round(wins[v["id"]] / n_runs * 100) for v in VESSELS
    }

    sorted_vessels = sorted(VESSELS, key=lambda v: attribution_scores[v["id"]], reverse=True)
    top = sorted_vessels[0]
    second = sorted_vessels[1]
    margin = attribution_scores[top["id"]] - attribution_scores[second["id"]]

    outcome = "ROBUST" if margin >= 30 else "UNRESOLVED" if margin < 10 else "COMPETING"

    result_vessels = []
    for v in VESSELS:
        s = attribution_scores[v["id"]]
        result_vessels.append({
            **v,
            "attribution_score": s,
            "score_class": score_color(s),
            "badge": "STRONG CANDIDATE" if s >= 60 else "PLAUSIBLE" if s >= 25 else "RULED OUT",
            "track_overlap_pct": round(s * 0.95),
        })

    return jsonify({
        "status": "complete",
        "slick_id": slick_id,
        "runs": n_runs,
        "vessels": result_vessels,
        "scenario_log": scenario_log,
        "top_candidate": top["id"],
        "margin_pts": margin,
        "outcome": outcome,
        "outcome_description": {
            "ROBUST": "Dominant signal — one clear culprit.",
            "COMPETING": "Similarly supported candidates — split signal.",
            "UNRESOLVED": "Multiple strong suspects — lost in the noise.",
        }[outcome],
    })

# ── Vessels list ────────────────────────────────────────────────────
@app.route("/api/vessels")
def vessels():
    return jsonify([
        {
            "id": "A", "name": "MV Kaveri Star",
            "mmsi": "419 002 481", "type": "Tanker", "imo": "9312410",
            "lat": 13.32, "lng": 80.42,
            "spatial_dist_km": 3.2, "temporal_delta": "+22 min",
        },
        {
            "id": "B", "name": "MT Porbandar",
            "mmsi": "419 118 226", "type": "Tanker", "imo": "9204471",
            "lat": 13.18, "lng": 80.55,
            "spatial_dist_km": 7.8, "temporal_delta": "-54 min",
        },
        {
            "id": "C", "name": "MV Coromandel",
            "mmsi": "419 004 733", "type": "Bulk carrier", "imo": "9118820",
            "lat": 13.45, "lng": 80.38,
            "spatial_dist_km": 11.4, "temporal_delta": "+3h 10m",
        },
    ])

if __name__ == "__main__":
    app.run(debug=True, port=5000)
