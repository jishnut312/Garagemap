"""
Production settings for Render deployment
"""
import os
import dj_database_url
from decouple import config

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-obskr51(a&os8!g=3$-wt1&w3fme1!!xpl%x=)pps@^b#bv@i$')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# Database Configuration
# Render provides DATABASE_URL automatically for PostgreSQL
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static Files Configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'staticfiles')

# Whitenoise configuration for serving static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security Settings for Production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
