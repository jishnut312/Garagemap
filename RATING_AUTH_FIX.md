# Rating System Authentication Error - Fix Guide

## 🔴 Error Description

```
401 Unauthorized
Error: Invalid authentication token
```

This error occurs when trying to submit a rating because the Django backend cannot verify the Firebase authentication token.

## 🔍 Root Cause

The Firebase Admin SDK on the backend needs the **Firebase service account credentials** to verify tokens. This file (`firebase-credentials.json`) might be:
1. Missing from the deployment
2. Not properly configured in environment variables
3. Not accessible due to file path issues

## ✅ Solution Options

### Option 1: **Use Environment Variable (Recommended for Production)**

Instead of using a JSON file, store the Firebase credentials as an environment variable.

#### Step 1: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

#### Step 2: Convert to Environment Variable
Copy the entire JSON content and set it as an environment variable on Render:

**On Render.com:**
1. Go to your backend service dashboard
2. Navigate to **Environment** tab
3. Add a new environment variable:
   - **Key**: `FIREBASE_CREDENTIALS_JSON`
   - **Value**: Paste the entire JSON content (as a single line or multiline)

#### Step 3: Update `firebase_auth.py`

Replace the Firebase initialization code:

```python
# OLD CODE (lines 12-23)
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
```

**WITH:**

```python
# NEW CODE
import json
from decouple import config

if not firebase_admin._apps:
    # Try to load from environment variable first (for production)
    firebase_creds_json = config('FIREBASE_CREDENTIALS_JSON', default=None)
    
    if firebase_creds_json:
        # Parse JSON from environment variable
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Fall back to file (for local development)
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Last resort: use Application Default Credentials
            firebase_admin.initialize_app()
```

---

### Option 2: **Upload Credentials File to Render**

If you prefer using the file approach:

1. Make sure `firebase-credentials.json` exists in your backend directory
2. Add it to your Git repository (⚠️ **NOT recommended for security**)
3. Or upload it manually to Render's persistent storage

---

### Option 3: **Temporary Fix - Make Reviews Public**

If you need a quick temporary fix while setting up credentials:

Update `backend/api/views.py`:

```python
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'workshop').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]  # ⚠️ TEMPORARY - allows unauthenticated access
    
    def perform_create(self, serializer):
        # For now, create reviews without user authentication
        review = serializer.save()
        review.workshop.update_rating()
```

**⚠️ WARNING**: This is NOT secure and should only be used for testing!

---

## 🔧 Implementation Steps (Recommended Solution)

### 1. Update `firebase_auth.py`

```python
"""
Firebase Authentication Middleware for Django
Verifies Firebase ID tokens and creates/retrieves Django users
"""
import firebase_admin
from firebase_admin import credentials, auth
from django.contrib.auth.models import User
from django.http import JsonResponse
from api.models import UserProfile
from decouple import config
import os
import json

# Initialize Firebase Admin SDK (only once)
if not firebase_admin._apps:
    # Try to load from environment variable first (for production)
    firebase_creds_json = config('FIREBASE_CREDENTIALS_JSON', default=None)
    
    if firebase_creds_json:
        try:
            # Parse JSON from environment variable
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized from environment variable")
        except Exception as e:
            print(f"❌ Error loading Firebase credentials from env: {e}")
            firebase_admin.initialize_app()
    else:
        # Fall back to file (for local development)
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized from credentials file")
        else:
            # Last resort: use Application Default Credentials
            firebase_admin.initialize_app()
            print("⚠️ Firebase initialized with default credentials")


class FirebaseAuthenticationMiddleware:
    """
    Middleware to authenticate users via Firebase tokens.
    Expects Authorization: Bearer <token> header.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for certain paths
        excluded_paths = ['/admin/', '/api/public/']
        if any(request.path.startswith(path) for path in excluded_paths):
            return self.get_response(request)

        # Get the authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]
            
            try:
                # Verify the Firebase token
                decoded_token = auth.verify_id_token(token)
                firebase_uid = decoded_token['uid']
                email = decoded_token.get('email', '')
                name = decoded_token.get('name', email.split('@')[0])
                
                # Get or create Django user
                user, created = User.objects.get_or_create(
                    username=firebase_uid[:150],  # Username has 150 char limit
                    defaults={
                        'email': email,
                        'first_name': name.split()[0] if name else '',
                        'last_name': ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                    }
                )
                
                # Get or create user profile
                profile, _ = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={'firebase_uid': firebase_uid}
                )
                
                # Attach user to request
                request.user = user
                request.firebase_user = decoded_token
                
            except Exception as e:
                # Invalid token
                print(f"❌ Firebase auth error: {e}")
                return JsonResponse({
                    'error': 'Invalid authentication token',
                    'detail': str(e)
                }, status=401)
        
        response = self.get_response(request)
        return response


def get_firebase_user(uid):
    """Helper function to get Firebase user details"""
    try:
        return auth.get_user(uid)
    except Exception as e:
        print(f"Error getting Firebase user: {e}")
        return None
```

### 2. Set Environment Variable on Render

1. Go to Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Set:
   - **Key**: `FIREBASE_CREDENTIALS_JSON`
   - **Value**: Your Firebase credentials JSON (entire content)

### 3. Redeploy

After setting the environment variable, redeploy your backend service on Render.

---

## 🧪 Testing

After implementing the fix:

1. **Test locally first**:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Test rating submission**:
   - Go to dashboard
   - Find a completed request
   - Click "Rate Service"
   - Submit a rating
   - Check browser console for errors

3. **Verify backend logs**:
   - Check Render logs for Firebase initialization message
   - Look for "✅ Firebase initialized from environment variable"

---

## 📋 Checklist

- [ ] Firebase credentials JSON obtained from Firebase Console
- [ ] Environment variable `FIREBASE_CREDENTIALS_JSON` set on Render
- [ ] `firebase_auth.py` updated with new initialization code
- [ ] Backend redeployed on Render
- [ ] Rating submission tested and working
- [ ] No 401 errors in browser console

---

## 🆘 Still Having Issues?

### Check These:

1. **Firebase credentials are valid**:
   - Download fresh credentials from Firebase Console
   - Ensure JSON is properly formatted

2. **Environment variable is set correctly**:
   - No extra spaces or line breaks
   - JSON is valid (test with `json.loads()`)

3. **Backend is using the updated code**:
   - Verify deployment completed successfully
   - Check Render logs for initialization messages

4. **Frontend is sending token correctly**:
   - Check browser Network tab
   - Verify `Authorization: Bearer <token>` header is present

---

## 💡 Quick Debug Commands

**Check if Firebase is initialized:**
```python
# In Django shell
python manage.py shell

>>> import firebase_admin
>>> firebase_admin._apps
# Should show initialized app
```

**Test token verification:**
```python
# In Django shell
from firebase_admin import auth

token = "YOUR_FIREBASE_TOKEN_HERE"
decoded = auth.verify_id_token(token)
print(decoded)
```

---

**Status**: 🔧 **Awaiting Implementation**

Choose Option 1 (Environment Variable) for the most secure and production-ready solution!
