"""
Firebase Authentication Middleware for Django
Verifies Firebase ID tokens and creates/retrieves Django users
"""
import firebase_admin
from firebase_admin import credentials, auth
from django.contrib.auth.models import User
from api.models import UserProfile
from decouple import config
import os
import json
import logging

logger = logging.getLogger(__name__)

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
            logger.info("Firebase initialized from environment variable")
        except Exception as e:
            logger.exception("Error loading Firebase credentials from env: %s", e)
            firebase_admin.initialize_app()
    else:
        # Fall back to file (for local development)
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized from credentials file")
        else:
            # Last resort: use Application Default Credentials
            firebase_admin.initialize_app()
            logger.warning("Firebase initialized with default credentials")


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
                # Invalid token - but don't block the request, just log it
                logger.warning("Firebase auth error: %s", e)
                # Don't return 401, let the view handle it
                pass
        
        response = self.get_response(request)
        return response


def get_firebase_user(uid):
    """Helper function to get Firebase user details"""
    try:
        return auth.get_user(uid)
    except Exception as e:
        logger.warning("Error getting Firebase user: %s", e)
        return None
