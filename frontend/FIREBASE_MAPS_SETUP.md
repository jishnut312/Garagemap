# 🔥 Firebase + Google Maps Setup Guide

## Step 1: Firebase Console Setup

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your existing project** or create a new one
3. **Get your Firebase config:**
   - Click "Project Settings" (gear icon)
   - Scroll down to "Your apps" section
   - Copy the config values

## Step 2: Enable Google Maps API in Firebase

1. **In Firebase Console**, click "Project Settings"
2. **Go to "General" tab**
3. **Find "Google Cloud Platform (GCP) resource location"**
4. **Click "Open Google Cloud Console"**
5. **Enable Maps JavaScript API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

## Step 3: Configure Environment Variables

Update your `.env.local` file with your Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Google Maps API Key (same as Firebase API key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Workshop Data in Firestore (Optional)

Want to store workshops in Firebase? Here's how:

### Create Firestore Collection:
1. Go to Firebase Console → Firestore Database
2. Create collection called `workshops`
3. Add documents with this structure:

```json
{
  "name": "AutoCare Pro Workshop",
  "address": "123 Main Street, Downtown",
  "rating": 4.8,
  "distance": "0.5 km",
  "services": ["Engine Repair", "Brake Service", "Oil Change"],
  "phone": "+1 234-567-8901",
  "lat": 40.7128,
  "lng": -74.0060,
  "isActive": true
}
```

## Step 5: Enhanced Map Component (Optional)

I can create a version that loads workshops from Firestore:

```typescript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Load workshops from Firestore
const loadWorkshops = async () => {
  const workshopsRef = collection(db, 'workshops');
  const snapshot = await getDocs(workshopsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Benefits of Firebase Integration:

✅ **Single API Key** - Use Firebase API key for both Firebase and Maps
✅ **Real-time Data** - Workshop data updates in real-time
✅ **User Authentication** - Add login/signup for workshop owners
✅ **Cloud Storage** - Store workshop images
✅ **Analytics** - Track user interactions
✅ **Hosting** - Deploy your app on Firebase Hosting

## Step 6: Restart Development Server

```bash
npm run dev
```

## Next Steps:

1. **Basic Setup**: Just add your Firebase config to `.env.local`
2. **Advanced**: Store workshop data in Firestore
3. **Pro**: Add user authentication and real-time updates

Your Firebase + Google Maps integration is ready! 🚀
