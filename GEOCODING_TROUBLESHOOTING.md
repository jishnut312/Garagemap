# Geocoding Troubleshooting Guide

## Issue: Still Seeing Coordinates Instead of Place Names

You're seeing: `11.8663, 75.3660`
You should see: `Kozhikode, Kerala`

## Step-by-Step Diagnosis

### Step 1: Test the Geocoding API

1. **Open the test page:**
   - Navigate to: `http://localhost:3001/geocoding-test`
   
2. **Open Browser DevTools:**
   - Press `F12` or right-click → Inspect
   - Go to the **Console** tab

3. **Click "Test Reverse Geocoding" button**

4. **Check the console logs:**
   - Look for logs with emojis: 🔍, 📍, 🔑, 📡, 📦, ✅
   - These will tell you exactly what's happening

### Step 2: Identify the Error

Look for these specific error messages:

#### Error 1: `REQUEST_DENIED`
```
❌ Geocoding failed with status: REQUEST_DENIED
🚫 REQUEST_DENIED: Check if Geocoding API is enabled in Google Cloud Console
```

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search for **"Geocoding API"**
5. Click **Enable**
6. Wait 1-2 minutes for it to activate
7. Refresh your page and try again

#### Error 2: `API Key not found`
```
❌ Google Maps API key not found in environment variables
Expected: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Solution:**
1. Check `frontend/.env.local` file
2. Make sure it has: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
3. Restart the dev server: `npm run dev`

#### Error 3: `OVER_QUERY_LIMIT`
```
⚠️ OVER_QUERY_LIMIT: You have exceeded your API quota
```

**Solution:**
- You've exceeded the free tier (40,000 requests/month)
- Check your usage in Google Cloud Console
- Consider enabling billing or wait for quota reset

#### Error 4: HTTP Referrer Restriction
```
Response status: 403 Forbidden
```

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**:
   - Select "None" (for testing)
   - OR add `localhost:3001` to allowed referrers
5. Save and try again

### Step 3: Quick Fix - Enable Geocoding API

**Most Common Issue:** Geocoding API is not enabled

1. **Go to:** https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
2. **Click:** "Enable"
3. **Wait:** 1-2 minutes
4. **Test:** Refresh page and click "Use My Location"

### Step 4: Verify API Key

Check your API key has these APIs enabled:
- ✅ **Geocoding API** (for reverse geocoding)
- ✅ **Maps JavaScript API** (for map display)
- ✅ **Places API** (optional, for autocomplete)

### Step 5: Check Console Logs

When you click "Use My Location" on `/map-workshop`, you should see:

**Success logs:**
```
✅ Location received: {latitude: 11.8663, longitude: 75.3660}
🔍 Starting reverse geocoding...
📍 Coordinates: 11.8663 75.3660
🔑 API Key present: true
🌐 Fetching from: https://maps.googleapis.com/maps/api/geocode/json?latlng=11.8663,75.3660&key=API_KEY_HIDDEN
📡 Response status: 200 OK
📦 API Response: {status: "OK", results: [...]}
✅ Formatted address: Kozhikode, Kerala, India
🏙️ Extracted - City: Kozhikode State: Kerala Country: India
📍 Place name: Kozhikode, Kerala
```

**Failure logs (example):**
```
❌ Geocoding failed with status: REQUEST_DENIED
🚫 REQUEST_DENIED: Check if Geocoding API is enabled in Google Cloud Console
```

## Quick Checklist

- [ ] Geocoding API is enabled in Google Cloud Console
- [ ] API key is in `.env.local` file
- [ ] Dev server was restarted after adding API key
- [ ] No HTTP referrer restrictions on API key (or localhost is allowed)
- [ ] Not over quota limit
- [ ] Browser console shows detailed logs

## Test Commands

### Restart Dev Server
```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

### Check Environment Variables
```bash
# In frontend directory
cat .env.local
# Should show: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

## Expected Behavior

### Before Fix
- Map Workshop: Shows `11.8663, 75.3660`
- Request Page: Empty address field

### After Fix
- Map Workshop: Shows `Kozhikode, Kerala`
- Request Page: Auto-filled with `Kozhikode, Kerala 673001, India`

## Still Not Working?

1. **Check browser console** for detailed error logs
2. **Visit test page:** `http://localhost:3001/geocoding-test`
3. **Share the console logs** - they will show exactly what's wrong
4. **Verify API key** in Google Cloud Console

## Contact Info

If you need help:
1. Open browser console (F12)
2. Click "Use My Location"
3. Copy all console logs
4. Share the logs to diagnose the issue

---

**Most likely issue:** Geocoding API is not enabled. Enable it in Google Cloud Console and it should work immediately! 🚀
