# PriceNestAI Debugging & Troubleshooting Guide

This guide helps diagnose and fix prediction flow issues end-to-end.

## Prerequisites

1. **Environment Files Created**: 
   - `server/.env` - Backend configuration
   - `client/.env` - Frontend configuration  

2. **Services Running** (required for predictions to work):
   - ✅ ML API (Flask) on `http://localhost:5001`
   - ✅ Backend (Express) on `http://localhost:5000`
   - ✅ Frontend (Vite) on `http://localhost:5173`
   - ✅ MongoDB instance (local or Atlas)

---

## Step 1: Start ML Service

The Machine Learning service must be running first, as the backend depends on it.

### Start ML Service

```bash
cd "d:\PriceNest AI\ml-api"

# Activate virtual environment (if not already active)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Run the Flask server
python app.py
```

**Expected Output:**
```
🚀 PriceNestAI ML Engine
📡 Running on http://0.0.0.0:5001
🏠 Accessible at http://localhost:5001
📊 Known locations: [number]
🤖 Model loaded and ready
```

### Verify ML Service Health

Open browser or terminal:
```bash
curl http://localhost:5001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "PriceNestAI ML Engine",
  "model_loaded": true,
  "locations": 15,
  "timestamp": "2024-..."
}
```

**If this fails:**
- Check if port 5001 is already in use: `netstat -ano | findstr 5001` (Windows) or `lsof -i :5001` (Mac/Linux)
- Ensure Python virtual environment is activated
- Check if `ml-api/models/house_price_model.json` exists (should auto-train if missing)
- Run: `python train.py` to retrain the model

---

## Step 2: Start Backend Server

The backend needs to connect to MongoDB and the ML service.

### Ensure MongoDB is Running

```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, connection string is in server/.env
```

### Start Backend

```bash
cd "d:\PriceNest AI\server"

# Install dependencies if needed
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 PriceNestAI Backend
📍 Running on http://localhost:5000
📡 ML API at: http://localhost:5001/predict
🔧 Environment: development
```

### Verify Backend Health

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "ok": true
}
```

**If this fails:**
- Check MongoDB connection: `mongosh` (Atlas) or local instance running
- Check MONGODB_URI in `server/.env`
- Check if port 5000 is already in use
- Check `npm run dev` logs for specific errors

---

## Step 3: Start Frontend

```bash
cd "d:\PriceNest AI\client"

# Install dependencies if needed
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in [time] ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 4: Test Prediction Flow End-to-End

### Open Browser DevTools

1. Open `http://localhost:5173` in browser
2. Press `F12` to open **Developer Tools**
3. Go to **Console** tab (you'll see logs here)

### Submit a Prediction

1. Navigate to **Predict** page
2. Fill in form with sample data:
   - Location: `Mumbai`
   - Area: `1200`
   - Bedrooms: `3`
   - Bathrooms: `2`
3. Click **Run Prediction**
4. Check browser Console for logs

### Expected Console Logs (Browser)

```
[AXIOS] Initializing with base URL: http://localhost:5000
[AXIOS] POST /api/predict
[AXIOS] Request data: {location: 'Mumbai', area: 1200, bedrooms: 3, bathrooms: 2}
[AXIOS] Authorization header added
[PREDICT] Form submitted with values: {location: 'Mumbai', area: 1200, bedrooms: 3, bathrooms: 2}
[PREDICT] Sending request to /api/predict
[AXIOS] Response 2xx: 200 {predictedPrice: 45000000, confidenceScore: 0.92}
[PREDICT] Response received: {predictedPrice: 45000000, confidenceScore: 0.92}
[PREDICT] Fetching similar properties...
[PREDICT] Similar properties fetched: X results
[PREDICT] Sorted and showing X similar listings
```

**If you see errors instead:** → Go to [Troubleshooting](#troubleshooting-prediction-errors) below

---

## Troubleshooting: Prediction Errors

### Error: `Failed to fetch API` or `Network Error`

**Cause:** Backend is not responding

**Check:**
1. Is backend running? `curl http://localhost:5000/health`
2. Is it on correct port? Check `server/.env` has `PORT=5000`
3. Are there CORS errors? Check server console for CORS-related messages
4. Is frontend using correct API URL? Check `client/.env` has `VITE_API_BASE_URL=http://localhost:5000`

**Fix:**
```bash
# Restart backend
cd "d:\PriceNest AI\server"
npm run dev
```

---

### Error: `Failed to reach ML API`

**Cause:** Backend can't connect to ML service

**Check:**
1. Is ML service running? `curl http://localhost:5001/health`
2. Is it on correct port? Check `server/.env` has `ML_API_BASE_URL=http://localhost:5001`
3. Check backend console for detailed error (should show connection refused)

**Expected backend log:**
```
[PREDICTION] Sending request to ML API: http://localhost:5001/predict
[PREDICTION] Payload: {location: 'Mumbai', ...}
[PREDICTION] ML API response: {predictedPrice: ..., confidenceScore: ...}
```

**If ML API isn't responding:**
```
[PREDICTION] Failed to reach ML API at http://localhost:5001/predict: {
  code: "ECONNREFUSED",
  ...
}
```

**Fix:**
```bash
# Start ML service
cd "d:\PriceNest AI\ml-api"
python app.py
```

---

### Error: `Invalid request body` or Validation Error

**Cause:** Form data doesn't match backend schema

**Check Browser Console:**
- Look for validation error message from backend
- Sample error: `Invalid request body: {"fieldErrors":{"location":["String must contain at least 2 character(s)"]}}`

**Fix:**
- Ensure all fields are filled
- Location must be at least 2 characters
- Area, Bedrooms, Bathrooms must be positive numbers

---

### Error: `Prediction Engine Unavailable`

**Cause:** ML service crashed or isn't responding

**Check:**
1. ML service logs for errors
2. Is Python correctly installed?
3. Does model file exist? `ml-api/models/house_price_model.json`

**Fix:**
```bash
# Retrain model
cd "d:\PriceNest AI\ml-api"
python train.py

# Then restart
python app.py
```

---

### No Results Displayed (Silent Failure)

**Cause:** Prediction succeeded but UI didn't update

**Check Browser Console:**
- Are responses showing?
- Is confidence score calculated?

**Fix:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check if localStorage token is invalid → logout and login again
3. Check browser console for React errors

---

## Complete Diagnostic Checklist

Run this to validate everything:

### Terminal 1: ML Service
```bash
cd "d:\PriceNest AI\ml-api"
python app.py
# Wait for: "🤖 Model loaded and ready"
```

### Terminal 2: Backend
```bash
cd "d:\PriceNest AI\server"
npm run dev
# Wait for: "👂 Running on http://localhost:5000"
```

### Terminal 3: Frontend
```bash
cd "d:\PriceNest AI\client"
npm run dev
# Wait for: "➜  Local:   http://localhost:5173"
```

### Terminal 4 (Optional): Test Endpoints
```bash
# Test ML Service
curl http://localhost:5001/health

# Test Backend Health
curl http://localhost:5000/health

# Test Prediction (requires backend listening)
curl -X POST http://localhost:5000/api/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"location\":\"Mumbai\",\"area\":1200,\"bedrooms\":3,\"bathrooms\":2}"
```

---

## Environment Variables Checklist

### `server/.env`
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pricenest
JWT_SECRET=your-secret-key-here
ML_API_BASE_URL=http://localhost:5001
ML_API_PREDICT_ENDPOINT=/predict
CLIENT_ORIGIN=http://localhost:5173
```

### `client/.env`
```
VITE_API_BASE_URL=http://localhost:5000
```

> Make sure these match the actual ports of running services!

---

## Log Interpretation Guide

### Frontend Logs (Browser Console)

| Log | Meaning |
|-----|---------|
| `[AXIOS] POST /api/predict` | Request sent to backend |
| `[AXIOS] Response 2xx: 200` | Backend responded successfully |
| `[PREDICT] Response received:` | Prediction data parsed |
| `[AXIOS] Request failed:` | Network or server error |
| `[PREDICT] Error occurred:` | Prediction failed, check details after this |

### Backend Logs (Terminal)

| Log | Meaning |
|-----|---------|
| `[SERVER] Incoming: POST /api/predict` | Request received |
| `[CONTROLLER] Prediction successful` | Backend processed request |
| `[PREDICTION] Sending request to ML API` | About to call ML service |
| `[PREDICTION] ML API response:` | ML service responded |
| `[PREDICTION] Failed to reach ML API` | **Critical:** ML service unreachable |

### ML Service Logs (Terminal)

| Log | Meaning |
|-----|---------|
| `[PREDICT] Success: {predictedPrice:...}` | Prediction generated successfully |
| `[PREDICT] Error:` | Validation or processing error |

---

## Quick Restart All Services

```bash
# Kill all Node and Python processes (Windows PowerShell)
Get-Process node, python | Stop-Process -Force

# Restart all three
# Terminal 1: ML
cd "d:\PriceNest AI\ml-api" ; python app.py

# Terminal 2: Backend
cd "d:\PriceNest AI\server" ; npm run dev

# Terminal 3: Frontend
cd "d:\PriceNest AI\client" ; npm run dev
```

---

## Performance Tips

1. **Slow Predictions?**
   - Check ML model training time  
   - Run: `python train.py` to optimize

2. **Timeouts?**
   - Increase timeout in `client/src/api/axios.ts`: change `timeout: 15000` to `30000`
   - Check backend logs for slow operations

3. **High Memory Usage?**
   - Close other applications
   - Rebuild frontend: `npm --prefix client run build`

---

## Still Stuck?

1. **Clear everything:**
   ```bash
   # Frontend
   cd client && rm -rf node_modules && npm install

   # Backend  
   cd server && rm -rf node_modules && npm install

   # Rebuild
   npm --prefix client run build
   npm --prefix server run build
   ```

2. **Check exact error messages** in browser DevTools and terminal output

3. **Verify all ports** are available and services loaded completely before proceeding

4. **Test with curl** from terminal to isolate frontend vs backend issues

5. **Check MongoDB** connection separately - run `mongosh` or Atlas dashboard

---

## Contact & Support

If issues persist, provide:
- ✅ All three service terminal outputs
- ✅ Browser DevTools console logs
- ✅ Error message details
- ✅ Environment variable values (sanitized)
- ✅ OS and Node version: `node --version`
