# Reverse Geocoding Feature

## Overview
The application now converts GPS coordinates (latitude/longitude) to human-readable place names using Google Maps Geocoding API.

## What Changed

### Before
- Location displayed as: `12.9716, 77.5946`
- Users saw raw coordinates

### After
- Location displayed as: `Bangalore, Karnataka, India`
- Users see actual place names

## Implementation

### Files Modified

1. **`src/lib/geocoding.ts`** (NEW)
   - Created utility functions for reverse geocoding
   - `reverseGeocode()` - Converts coordinates to address
   - `getShortLocation()` - Returns short format (City, State)
   - `formatCoordinates()` - Fallback for failed geocoding

2. **`src/app/map-workshop/page.tsx`**
   - Updated "Use My Location" button
   - Now shows place name instead of coordinates
   - Example: "Bangalore, Karnataka" instead of "12.9716, 77.5946"

3. **`src/app/request/[mechanicId]/page.tsx`**
   - Auto-fills address field with place name
   - Shows "Location detected and address auto-filled" message
   - Address field is pre-populated with full formatted address

## How It Works

1. **User clicks "Use My Location"**
2. Browser requests GPS coordinates
3. App receives latitude/longitude
4. **Reverse geocoding happens:**
   - Sends coordinates to Google Maps Geocoding API
   - Receives formatted address and components (city, state, country)
   - Extracts relevant information
5. **Display to user:**
   - Map Workshop page: Shows "City, State" format
   - Request page: Auto-fills full address

## API Usage

### Google Maps Geocoding API
- **Endpoint:** `https://maps.googleapis.com/maps/api/geocode/json`
- **Parameters:** `latlng={lat},{lng}&key={API_KEY}`
- **Response:** Contains formatted address and address components

### Example Response Structure
```json
{
  "results": [
    {
      "formatted_address": "123 Main St, Bangalore, Karnataka 560001, India",
      "address_components": [
        {
          "long_name": "Bangalore",
          "types": ["locality"]
        },
        {
          "long_name": "Karnataka",
          "types": ["administrative_area_level_1"]
        },
        {
          "long_name": "India",
          "types": ["country"]
        }
      ]
    }
  ]
}
```

## Error Handling

### Fallback Mechanism
If reverse geocoding fails (network error, API limit, etc.):
- Falls back to displaying coordinates
- Format: `12.9716, 77.5946`
- User still sees their location, just not as a place name

### Common Failure Scenarios
1. **No API key** - Falls back to coordinates
2. **Network error** - Falls back to coordinates
3. **API quota exceeded** - Falls back to coordinates
4. **Invalid coordinates** - Falls back to coordinates

## Benefits

### User Experience
- ✅ More intuitive location display
- ✅ Easier to understand where you are
- ✅ Professional appearance
- ✅ Auto-filled addresses save typing

### Technical
- ✅ Graceful degradation (fallback to coordinates)
- ✅ Async/await for clean code
- ✅ Reusable utility functions
- ✅ Type-safe with TypeScript

## Testing

### To Test the Feature

1. **Navigate to Map Workshop page** (`/map-workshop`)
2. Click "Use My Location" button
3. Allow location access
4. **Expected:** See place name like "Bangalore, Karnataka"

5. **Navigate to Request Service page** (`/request/[mechanicId]`)
6. Page loads
7. **Expected:** Address field auto-filled with full address

### Test Cases
- ✅ Location permission granted
- ✅ Location permission denied (shows error)
- ✅ Geocoding succeeds (shows place name)
- ✅ Geocoding fails (shows coordinates)
- ✅ No internet connection (shows coordinates)

## API Key Requirements

### Google Maps Geocoding API
Make sure the API key has the following API enabled:
- ✅ **Geocoding API** (for reverse geocoding)
- ✅ **Maps JavaScript API** (for map display)

### Enable in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" → "Library"
4. Search for "Geocoding API"
5. Click "Enable"

## Rate Limits

### Google Maps Geocoding API
- **Free tier:** 40,000 requests/month
- **Cost:** $5 per 1,000 requests after free tier
- **Recommendation:** Implement caching for production

### Future Optimization
Consider implementing:
- Client-side caching (localStorage)
- Server-side caching (Redis)
- Debouncing for rapid location changes

## Future Enhancements

### Possible Improvements
1. **Caching:** Store geocoded results to reduce API calls
2. **Autocomplete:** Add Google Places Autocomplete for manual address entry
3. **Multiple Languages:** Support geocoding in user's preferred language
4. **Nearby Landmarks:** Show nearby landmarks for better context
5. **Accuracy Indicator:** Show GPS accuracy level

## Troubleshooting

### Issue: Still seeing coordinates instead of place names

**Solution:**
1. Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Verify Geocoding API is enabled in Google Cloud Console
3. Check browser console for API errors
4. Verify API key restrictions (if any)

### Issue: "Location detected" but no address

**Solution:**
1. Check network tab for failed API requests
2. Verify API key is valid
3. Check if you've exceeded quota
4. Look for CORS errors

### Issue: Address in wrong language

**Solution:**
- Add `language` parameter to geocoding request
- Example: `&language=en` for English

## Code Example

### Using the Geocoding Utility

```typescript
import { reverseGeocode, getShortLocation, formatCoordinates } from '@/lib/geocoding';

// Get user's location
navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  
  // Perform reverse geocoding
  const result = await reverseGeocode(lat, lng);
  
  if (result) {
    // Show short location
    const shortName = getShortLocation(result); // "Bangalore, Karnataka"
    
    // Or use full address
    const fullAddress = result.formattedAddress; // "123 Main St, Bangalore..."
  } else {
    // Fallback to coordinates
    const coords = formatCoordinates(lat, lng); // "12.9716, 77.5946"
  }
});
```

## Related Files

- `src/lib/geocoding.ts` - Geocoding utilities
- `src/app/map-workshop/page.tsx` - Map workshop implementation
- `src/app/request/[mechanicId]/page.tsx` - Service request form
- `frontend/env.example` - Environment variables template

## Support

For issues or questions:
- Check browser console for errors
- Verify API key configuration
- Review Google Cloud Console for API status
- Check network tab for failed requests
