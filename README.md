## AI-Powered Real Estate Price Prediction Platform (MERN + ML)

This is a production-style **beginner-friendly** project that predicts real-estate prices using a **Python Flask ML API** and serves data/auth via a **Node.js + Express (MongoDB/Mongoose)** backend. The frontend is **React + Tailwind**.

### ⚡ Quick Start (30 seconds)

**Option 1: Automated (Windows)**
```bash
# Double-click this file to start all three services:
START_SERVICES.bat

# Or in PowerShell:
.\START_SERVICES.ps1
```

Both scripts open separate terminal windows for:
- ✅ ML API (Flask) on `port 5001`
- ✅ Backend (Express) on `port 5000`
- ✅ Frontend (React) on `port 5173`

Then visit: `http://localhost:5173`

**Option 2: Manual (All Platforms)**

Each service needs its own terminal:

```bash
# Terminal 1: ML API
cd "PriceNest AI/ml-api"
python app.py

# Terminal 2: Backend
cd "PriceNest AI/server"
npm run dev

# Terminal 3: Frontend
cd "PriceNest AI/client"
npm run dev
```

---

### 🔧 Full Setup Instructions

#### Prerequisites
- ✅ **Node.js 16+** - [Download](https://nodejs.org)
- ✅ **Python 3.8+** - [Download](https://www.python.org)
- ✅ **MongoDB** - Local instance or [Atlas](https://www.mongodb.com/cloud/atlas) (free)
- ✅ **Git**

#### Step 1: Clone & Install Dependencies

```bash
cd "d:\PriceNest AI"

# Install frontend
npm --prefix client install

# Install backend
npm --prefix server install
```

#### Step 2: Set Environment Variables

**Backend (`server/.env`)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pricenest
JWT_SECRET=your-secret-key-here
ML_API_BASE_URL=http://localhost:5001
ML_API_PREDICT_ENDPOINT=/predict
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend (`client/.env`)**
```
VITE_API_BASE_URL=http://localhost:5000
```

#### Step 3: Set Up ML Service

```bash
cd "d:\PriceNest AI\ml-api"

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify it works
python app.py
```

Expected output:
```
🚀 PriceNestAI ML Engine
📡 Running on http://0.0.0.0:5001
🏠 Accessible at http://localhost:5001
📊 Known locations: 15
🤖 Model loaded and ready
```

#### Step 4: Ensure MongoDB is Running

```bash
# Check if local MongoDB is running
mongosh

# OR use MongoDB Atlas
# Update MONGODB_URI in server/.env with your Atlas connection string
```

#### Step 5: Seed Sample Data (Optional)

```bash
cd "d:\PriceNest AI\server"
npm run seed
```

This creates:
- Sample user: `admin@pricenest.ai` / `admin123`
- 50+ sample properties
- Mock analytics data

---

### 🎯 Testing the Prediction Flow

1. **Open browser**: `http://localhost:5173`
2. **Go to Predict page**
3. **Fill form**:
   - Location: `Mumbai`
   - Area: `1200` sqft
   - Bedrooms: `3`
   - Bathrooms: `2`
4. **Click "Run Prediction"**
5. **Check browser console (F12)** for detailed logs

**Expected success:**
- ✅ Price estimate displays
- ✅ Confidence meter shows percentage
- ✅ Similar properties list appears
- ✅ No errors in console

---

### 🐛 Troubleshooting

**Prediction shows errors?** → Read [DEBUGGING.md](./DEBUGGING.md)

Common issues:
- ❌ Backend not running → `npm --prefix server run dev`
- ❌ ML API not running → `cd ml-api && python app.py`
- ❌ MongoDB not running → Start MongoDB service
- ❌ Wrong environment variables → Check `.env` files against `.env.example`

**See [DEBUGGING.md](./DEBUGGING.md) for complete troubleshooting guide with:**
- Real console log examples
- Service health checks
- Step-by-step diagnosis
- Port conflict resolution
- Performance optimization

---

### 📊 Features

- **JWT Authentication** (`register`, `login`, `logout`)
- **Property Management** (view, search, filter by price/location/BHK)
- **AI Price Prediction** (Flask ML model with confidence scoring)
- **Favorites System** (save properties to wishlist)
- **Analytics Dashboard** (price trends, market insights)
- **Similar Properties** (find comparable listings)
- **Responsive UI** (dark theme with glassmorphism, mobile-friendly)
- **Real-time Search** (location & natural language)

---

### 🏗️ Architecture

```
PriceNest AI/
├── client/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/            # Home, Auth, Predict, Dashboard, Properties, Compare
│   │   ├── components/       # NavBar, PropertyCard, SearchFilters
│   │   ├── api/              # Axios + typed endpoints
│   │   └── auth/             # JWT context
│   └── package.json
│
├── server/                    # Express + MongoDB + TypeScript
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (including ML call)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   └── utils/            # Helpers
│   └── package.json
│
├── ml-api/                    # Flask + scikit-learn
│   ├── app.py                # /predict endpoint
│   ├── train.py              # Model training
│   ├── models/               # Trained model (auto-generated)
│   └── requirements.txt
│
├── ml-data/                   # Training dataset
│   └── house_prices.csv
│
├── DEBUGGING.md              # Complete troubleshooting guide
├── START_SERVICES.bat        # Windows startup script
└── START_SERVICES.ps1        # PowerShell startup script
```

---

### 🚀 Production Deployment

**Frontend** → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_API_BASE_URL to backend URL
```

**Backend** → Render / Railway
```bash
# Set environment variables:
MONGODB_URI=your_atlas_uri
JWT_SECRET=strong_secret
ML_API_BASE_URL=your_ml_api_url
CLIENT_ORIGIN=your_frontend_url
# Run: npm start
```

**ML API** → Render / Railway
```bash
# Run: python app.py
# Port will be assigned by platform
```

**Database** → MongoDB Atlas (free tier)
- Create cluster
- Set database user
- Copy connection string to backend `.env`

---

### 📚 API Endpoints

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Clear session

#### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties?location=Mumbai&minPrice=1000000` - Filter
- `GET /api/properties/:id` - Get details
- `POST /api/properties` - Create (admin only)
- `PUT /api/properties/:id` - Update (admin only)
- `DELETE /api/properties/:id` - Delete (admin only)

#### Prediction
- `POST /api/predict` - Get price estimate
  ```json
  Request:
  {
    "location": "Mumbai",
    "area": 1200,
    "bedrooms": 3,
    "bathrooms": 2
  }
  Response:
  {
    "predictedPrice": 4500000,
    "confidenceScore": 0.92
  }
  ```

#### Favorites
- `GET /api/favorites` - List saved properties
- `POST /api/favorites/:propertyId` - Save property
- `DELETE /api/favorites/:propertyId` - Remove from favorites

#### Analytics
- `GET /api/analytics/trends` - Price trends
- `GET /api/analytics/insights` - Market insights

---

### 🧪 Testing

**Build frontend:**
```bash
npm --prefix client run build
```

**Build backend:**
```bash
npm --prefix server run build
```

**Run tests (if configured):**
```bash
npm --prefix client run test
npm --prefix server  run test
```

---

### 📝 Environment Variables

See `.env.example` files in each directory:
- `server/.env.example` - Backend config
- `client/.env.example` - Frontend config

---

### 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open Pull Request

---

### 📄 License

MIT License - see LICENSE file

---

### 💡 Notes

- The ML model trains automatically on first run
- Sample data loads via seed script (`npm --prefix server run seed`)
- Admin user: `admin@pricenest.ai` / `admin123` (change in production!)
- All timestamps in UTC
- JWT tokens expire after 7 days

---

### ⚠️ Support

**Issues?** Check [DEBUGGING.md](./DEBUGGING.md) first!

For detailed step-by-step troubleshooting:
- Service startup problems
- Network/CORS issues
- Database connectivity
- Prediction errors
- Environment variable validation

---

### 📞 Quick Reference

| Issue | Solution |
|-------|----------|
| Prediction shows errors | ML API not running - see `ml-api/` |
| Can't connect to backend | Port 5000 already in use or process isn't running |
| Database error | MongoDB not running or wrong URI |
| Frontend won't load | Frontend not running on port 5173 |
| Model training issue | Check `ml-api/requirements.txt` dependency versions |

**Read DEBUGGING.md for complete diagnostic steps!**


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

