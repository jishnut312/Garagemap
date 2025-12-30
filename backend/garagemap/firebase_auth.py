"""
Firebase Authentication Middleware for Django
Verifies Firebase ID tokens and creates/retrieves Django users
"""
import firebase_admin
from firebase_admin import credentials, auth
from django.contrib.auth.models import User
from django.http import JsonResponse
from api.models import UserProfile
import os

# Initialize Firebase Admin SDK (only once)
if not firebase_admin._apps:
    # Use your Firebase service account credentials
    # You can download this from Firebase Console > Project Settings > Service Accounts
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
    
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # For development, you can use Application Default Credentials
        firebase_admin.initialize_app()


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
