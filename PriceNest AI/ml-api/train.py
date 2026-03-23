import os
import csv
import json
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class TrainConfig:
    dataset_path: str
    model_path: str


def mean_std(values: List[float]) -> Tuple[float, float]:
    mean = sum(values) / max(len(values), 1)
    var = sum((v - mean) ** 2 for v in values) / max(len(values), 1)
    std = var ** 0.5
    # Avoid division by zero in standardization.
    if std == 0:
        std = 1.0
    return mean, std


def mat_mul(A: List[List[float]], B: List[List[float]]) -> List[List[float]]:
    n = len(A)
    m = len(B[0])
    k = len(B)
    out = [[0.0 for _ in range(m)] for __ in range(n)]
    for i in range(n):
        for kk in range(k):
            ai = A[i][kk]
            for j in range(m):
                out[i][j] += ai * B[kk][j]
    return out


def mat_vec_mul(A: List[List[float]], v: List[float]) -> List[float]:
    n = len(A)
    out = [0.0 for _ in range(n)]
    for i in range(n):
        s = 0.0
        for j in range(len(v)):
            s += A[i][j] * v[j]
        out[i] = s
    return out


def invert_matrix(A: List[List[float]]) -> List[List[float]]:
    # Gauss-Jordan inversion with partial pivoting.
    n = len(A)
    if any(len(row) != n for row in A):
        raise ValueError("Matrix must be square")

    # Build augmented matrix [A | I]
    aug = []
    for i in range(n):
        aug.append([float(x) for x in A[i]] + [0.0] * n)
        aug[i][n + i] = 1.0

    eps = 1e-12

    for col in range(n):
        # Find pivot row
        pivot_row = col
        best = abs(aug[col][col])
        for r in range(col + 1, n):
            v = abs(aug[r][col])
            if v > best:
                best = v
                pivot_row = r

        if best < eps:
            raise ValueError("Matrix inversion failed (singular/ill-conditioned)")

        # Swap rows if needed
        if pivot_row != col:
            aug[col], aug[pivot_row] = aug[pivot_row], aug[col]

        # Normalize pivot row
        pivot = aug[col][col]
        for c in range(2 * n):
            aug[col][c] /= pivot

        # Eliminate other rows
        for r in range(n):
            if r == col:
                continue
            factor = aug[r][col]
            if factor == 0:
                continue
            for c in range(2 * n):
                aug[r][c] -= factor * aug[col][c]

    # Extract inverse from right side
    inv = []
    for i in range(n):
        inv.append(aug[i][n : 2 * n])
    return inv


def train_and_save(cfg: TrainConfig, alpha: float = 1.0) -> dict:
    required = ["location", "area", "bedrooms", "bathrooms", "price"]

    locations_list: List[str] = []
    area_list: List[float] = []
    bedrooms_list: List[float] = []
    bathrooms_list: List[float] = []
    price_list: List[float] = []

    with open(cfg.dataset_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []
        missing = set(required) - set(header)
        if missing:
            raise ValueError(f"Dataset missing columns: {sorted(missing)}")

        for row in reader:
            locations_list.append(str(row["location"]).strip())
            area_list.append(float(row["area"]))
            bedrooms_list.append(float(row["bedrooms"]))
            bathrooms_list.append(float(row["bathrooms"]))
            price_list.append(float(row["price"]))

    known_locations = sorted(set(locations_list))
    k = len(known_locations)
    p = k + 3  # one-hot + standardized numeric features

    mean_area, std_area = mean_std(area_list)
    mean_bed, std_bed = mean_std(bedrooms_list)
    mean_bath, std_bath = mean_std(bathrooms_list)

    # Build X^T X and X^T y in one pass (ridge regression closed-form).
    xtx = [[0.0 for _ in range(p)] for __ in range(p)]
    xty = [0.0 for _ in range(p)]

    loc_to_idx = {loc: i for i, loc in enumerate(known_locations)}

    for i in range(len(price_list)):
        loc = locations_list[i]
        x_cat = [0.0 for _ in range(k)]
        if loc in loc_to_idx:
            x_cat[loc_to_idx[loc]] = 1.0

        # standardized numeric features
        a = (area_list[i] - mean_area) / std_area
        b = (bedrooms_list[i] - mean_bed) / std_bed
        bt = (bathrooms_list[i] - mean_bath) / std_bath

        x = x_cat + [a, b, bt]
        y = price_list[i]

        # Update xtx, xty
        for r in range(p):
            xty[r] += x[r] * y
            xr = x[r]
            for c in range(p):
                xtx[r][c] += xr * x[c]

    # Ridge: add alpha to diagonal of X^T X
    for d in range(p):
        xtx[d][d] += alpha

    inv_xtx = invert_matrix(xtx)
    beta = mat_vec_mul(inv_xtx, xty)

    model_dir = os.path.dirname(cfg.model_path)
    if model_dir:
        os.makedirs(model_dir, exist_ok=True)

    payload = {
        "beta": [float(v) for v in beta],
        "known_locations": known_locations,
        "means": [float(mean_area), float(mean_bed), float(mean_bath)],
        "stds": [float(std_area), float(std_bed), float(std_bath)],
        "alpha": float(alpha),
    }
    with open(cfg.model_path, "w", encoding="utf-8") as f:
        json.dump(payload, f)

    return {"n_rows": len(price_list), "n_locations": k}


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.environ.get(
        "ML_DATASET_PATH",
        os.path.join(base_dir, "..", "ml-data", "house_prices.csv"),
    )
    model_path = os.environ.get(
        "ML_MODEL_PATH",
        os.path.join(base_dir, "models", "house_price_model.json"),
    )
    cfg = TrainConfig(dataset_path=dataset_path, model_path=model_path)
    metrics = train_and_save(cfg, alpha=float(os.environ.get("ML_RIDGE_ALPHA", "1.0")))
    print("Training complete:", metrics)

