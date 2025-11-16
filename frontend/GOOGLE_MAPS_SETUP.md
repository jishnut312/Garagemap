# Google Maps Setup Instructions

## Step 1: Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. Create an API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

## Step 2: Add Your API Key

1. Rename `env.local` to `.env.local`
2. Replace `your_api_key_here` with your actual API key:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Restart Your Development Server

```bash
npm run dev
```

## Step 4: Test Your Map

Visit `http://localhost:3000/map-workshop` and you should see:
- ✅ Real Google Maps with streets and satellite imagery
- ✅ Red markers for each workshop location
- ✅ Blue marker for your location when you click "Use My Location"
- ✅ Interactive map controls (zoom, pan, etc.)

## Troubleshooting

### If you see "For development purposes only" watermark:
- Add your domain to API key restrictions in Google Cloud Console

### If the map doesn't load:
- Check browser console for errors
- Verify your API key is correct
- Make sure Maps JavaScript API is enabled

### If markers don't appear:
- Check that workshop coordinates are valid
- Verify the API key has proper permissions

## Features Now Available

- **Real satellite/street view maps**
- **Accurate workshop locations**
- **GPS-based user location**
- **Interactive map controls**
- **Professional map styling**
- **Clickable markers with info windows**

Your workshop finder now uses real Google Maps! 🗺️
