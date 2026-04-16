## Architecture (Clean, Production-Style)

This project follows a practical “clean” layering approach:

### Frontend (React + Tailwind)
- Pages: compose UI for each route (Home, Properties, Details, Predict, Dashboard, Auth).
- Components: reusable UI pieces (`NavBar`, `PropertyCard`, `SearchFilters`, `TrendChart`).
- API layer (`client/src/api/*`): a typed Axios client + small endpoint wrappers.
- Auth context (`client/src/auth/*`): stores JWT in `localStorage` and attaches it to requests.

### Backend (Express + Mongoose)
- Routes (`server/src/routes/*`): HTTP endpoints + request validation middleware.
- Controllers (`server/src/controllers/*`): translate HTTP to service calls.
- Services (`server/src/services/*`): business logic (auth, properties/search, favorites, recommendations, analytics, ML predictions).
- Models (`server/src/models/*`): Mongoose schemas + indexes.
- Middleware (`server/src/middleware/*`):
  - `requireAuth` / `requireAdmin` for JWT protection
  - `validateBody` / `validateQuery` using Zod
  - `errorHandler` for consistent JSON errors

### ML Service (Flask + scikit-learn)
- `train.py`: trains a scikit-learn pipeline (OneHotEncoder + RandomForestRegressor) and saves it with `joblib`.
- `app.py`: loads the saved model (training automatically if missing) and exposes:
  - `POST /predict` -> `{ predictedPrice }`

### Integration Flow
1. Frontend calls backend `/api/predict` via Axios.
2. Backend calls Flask `/predict` using Axios.
3. Flask returns `predictedPrice` and backend returns it to the frontend.

### Recommendation & Trend
- Recommendations: Node computes a lightweight similarity score using numeric feature similarity + location match.
- Trend analytics: Node aggregates each property’s `history` array into monthly averages.

