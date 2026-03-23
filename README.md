## AI-Powered Real Estate Price Prediction Platform (MERN + ML)

This is a production-style **beginner-friendly** project that predicts real-estate prices using a **Python Flask ML API** and serves data/auth via a **Node.js + Express (MongoDB/Mongoose)** backend. The frontend is **React + Tailwind**.

### Features
- JWT auth (`register`, `login`)
- Property CRUD (admin-style simple endpoints; users can view/search)
- Property search & filters (price, location, BHK)
- Natural language search (basic): e.g. `2BHK under 50 lakh`
- Save/favorite properties
- Recommendations (similar properties via simple feature similarity)
- Price trend analytics (basic line chart based on sample history)
- Frontend dashboard with charts

### Repo layout
- `client/` React + Tailwind app
- `server/` Express + Mongoose API
- `ml-api/` Flask ML service exposing `/predict`
- `ml-data/` sample dataset used to train the model

### Folder Structure (key files)
- `client/`
  - `src/pages/*`: `Home`, `Properties`, `PropertyDetails`, `Predict`, `Dashboard`, `Auth`
  - `src/api/*`: typed Axios calls to the backend
  - `src/components/*`: reusable UI (filters, cards, nav)
- `server/`
  - `src/models/*`: `User`, `Property`, `Favorite` (with indexes)
  - `src/routes/*`: REST routes
  - `src/controllers/*`: request -> service mapping
  - `src/services/*`: business logic (auth, search, favorites, recommendations, analytics, ML call)
  - `src/seed/*`: sample data + admin user seed
- `ml-api/`
  - `app.py`: Flask server with `/predict`
  - `train.py`: trains and saves a scikit-learn model to `models/`
  - `ml-data/house_prices.csv`: sample dataset

### Quick start (local)
Follow these steps from the repo root (`D:/PriceNest AI`):

1. **ML API**
   - `cd ml-api`
   - `python -m venv .venv`
   - `.\.venv\Scripts\Activate.ps1`
   - `pip install -r requirements.txt`
   - `python app.py`
   - (Flask will start on `http://localhost:5001`)

2. **Backend**
   - `cd server`
   - `npm install`
   - Create an `.env` file (see `server/.env.example`)
   - Seed sample data:
     - `npm run seed`
     - Seed script creates an admin user if missing (default: `admin@pricenest.ai` / `admin123`, override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
   - `npm run dev`
   - (API will start on `http://localhost:5000`)

3. **Frontend**
   - `cd client`
   - `npm install`
   - Create an `.env` file (see `client/.env.example`)
   - `npm run dev`
   - (React will start on `http://localhost:5173`)

### Deployment (high level)
- **Frontend**: Vercel (build from `client/`, set `VITE_API_BASE_URL`)
- **Backend**: Render (run `server/` with `npm start`, set `MONGODB_URI`, `JWT_SECRET`, `ML_API_BASE_URL`)
- **ML API**: Render/Railway (run `ml-api/app.py` on port `5001`)
- **MongoDB**: MongoDB Atlas (set `MONGODB_URI` in backend env)

Detailed environment variables and endpoints are documented in each service folder.

### Deployment Steps (quick + practical)
1. **MongoDB Atlas**
   - Create a cluster and database user.
   - Copy the connection string and set `MONGODB_URI` in Backend env.
2. **ML API (Flask)**
   - Deploy `ml-api/` and run `python app.py`.
   - Ensure the runtime has `ML_DATASET_PATH` (defaults to `../ml-data/house_prices.csv` relative to `ml-api/`).
   - Ensure `ML_MODEL_PATH` is writable (defaults to `ml-api/models/`).
3. **Backend (Node/Express)**
   - Deploy `server/` and run:
     - `npm install`
     - `npm start`
   - Set:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `ML_API_BASE_URL` (e.g. your ML service URL)
     - `CLIENT_ORIGIN` to your Vercel URL (for CORS)
4. **Frontend (React/Vite)**
   - Deploy `client/` to Vercel.
   - Set `VITE_API_BASE_URL` to your Backend URL.
   - Vercel will build static assets automatically.

### Notes
- The ML model is trained on first run if no saved model exists.
- Sample property data and sample user are loaded via a seed script (run from `server/`).

### Backend API (summary)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/properties` (filters)
- `GET /api/properties/:id` (details + recommendations)
- `GET /api/properties/:id/recommendations`
- `POST /api/predict` (ML: `location, area, bedrooms, bathrooms`)
- `GET /api/properties/search-natural?query=...`
- `GET /api/analytics/trend?location=...&months=...`
- Favorites (JWT required):
  - `GET /api/favorites`
  - `POST /api/favorites/:propertyId`
  - `DELETE /api/favorites/:propertyId`

Admin-only CRUD:
- `POST /api/properties`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`

