import os
import json
from typing import Any, Dict, List

from flask import Flask, jsonify, request

from train import train_and_save, TrainConfig


def add_cors_headers(response):
    """Add CORS headers to response so frontend can access API"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Defaults are resolved relative to this file so local runs work from any CWD.
MODEL_PATH = os.environ.get(
    "ML_MODEL_PATH",
    os.path.join(BASE_DIR, "models", "house_price_model.json")
)
DATASET_PATH = os.environ.get(
    "ML_DATASET_PATH",
    os.path.join(BASE_DIR, "..", "ml-data", "house_prices.csv")
)
PORT = int(os.environ.get("PORT", "5001"))


class HousePriceModel:
    def __init__(
        self,
        beta: List[float],
        known_locations: List[str],
        means: List[float],
        stds: List[float],
        alpha: float,
    ) -> None:
        self.beta = beta
        self.known_locations = known_locations
        self.means = means
        self.stds = stds
        self.alpha = alpha

    def featurize(
        self, location: str, area: float, bedrooms: float, bathrooms: float
    ) -> List[float]:
        # One-hot + standardized numeric features
        loc_to_idx = {loc: i for i, loc in enumerate(self.known_locations)}
        idx = loc_to_idx.get(location, -1)

        k = len(self.known_locations)
        x_cat = [0.0 for _ in range(k)]
        if idx >= 0:
            x_cat[idx] = 1.0

        mean_area, mean_bed, mean_bath = self.means
        std_area, std_bed, std_bath = self.stds

        a = (area - mean_area) / (std_area if std_area != 0 else 1.0)
        b = (bedrooms - mean_bed) / (std_bed if std_bed != 0 else 1.0)
        bt = (bathrooms - mean_bath) / (std_bath if std_bath != 0 else 1.0)

        return x_cat + [a, b, bt]  # length k+3


def load_model() -> HousePriceModel:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        return HousePriceModel(
            beta=[float(v) for v in data["beta"]],
            known_locations=list(data["known_locations"]),
            means=[float(v) for v in data["means"]],
            stds=[float(v) for v in data["stds"]],
            alpha=float(data.get("alpha", 1.0)),
        )

    # Train if not found
    cfg = TrainConfig(dataset_path=DATASET_PATH, model_path=MODEL_PATH)
    train_and_save(cfg, alpha=float(os.environ.get("ML_RIDGE_ALPHA", "1.0")))
    return load_model()


app = Flask(__name__)
model = load_model()

# Register CORS handler
app.after_request(add_cors_headers)


def validate_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    required = ["location", "area", "bedrooms", "bathrooms"]
    missing = [k for k in required if k not in payload]
    if missing:
        raise ValueError(f"Missing fields: {missing}")

    location = str(payload["location"]).strip()
    if len(location) < 2:
        raise ValueError("location must be a non-empty string")

    def to_float(name: str) -> float:
        v = payload[name]
        try:
            f = float(v)
        except Exception:
            raise ValueError(f"{name} must be a number")
        if f <= 0:
            raise ValueError(f"{name} must be > 0")
        return f

    area = to_float("area")
    bedrooms = to_float("bedrooms")
    bathrooms = to_float("bathrooms")
    return {
        "location": location,
        "area": area,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
    }


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "PriceNestAI ML Engine",
        "model_loaded": True,
        "locations": len(model.known_locations),
        "timestamp": __import__("datetime").datetime.utcnow().isoformat()
    })


@app.post("/predict")
def predict():
    try:
        payload = request.get_json(force=True) or {}
        cleaned = validate_payload(payload)

        feat = model.featurize(
            location=cleaned["location"],
            area=cleaned["area"],
            bedrooms=cleaned["bedrooms"],
            bathrooms=cleaned["bathrooms"],
        )
        pred = 0.0
        for i in range(len(feat)):
            pred += float(feat[i]) * float(model.beta[i])
        predicted = float(round(pred, 2))
        confidence_score = 0.92 if cleaned["location"] in model.known_locations else 0.64
        
        response = {
            "predictedPrice": predicted,
            "confidenceScore": round(confidence_score, 2),
        }
        print(f"[PREDICT] Success: {response}")
        return jsonify(response)
    except Exception as e:
        error_msg = str(e)
        print(f"[PREDICT] Error: {error_msg}")
        return jsonify({"error": "Invalid request", "details": error_msg}), 400


if __name__ == "__main__":
    print(f"\n🚀 PriceNestAI ML Engine")
    print(f"📡 Running on http://0.0.0.0:{PORT}")
    print(f"🏠 Accessible at http://localhost:{PORT}")
    print(f"📊 Known locations: {len(model.known_locations)}")
    print(f"🤖 Model loaded and ready\\n")
    app.run(host="0.0.0.0", port=PORT, debug=False)

