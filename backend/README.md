# GarageMap Django Backend + Firebase Integration

This Django backend works **alongside Firebase** to provide:
- Custom business logic and APIs
- Admin panel for managing data
- Firebase Authentication integration
- RESTful API endpoints

## 🔥 Architecture Overview

```
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌────────┐  ┌──────────┐
│Firebase│  │ Django   │
│ Auth   │  │ Backend  │
│Storage │  │   API    │
│Firestore│ │          │
└────────┘  └──────────┘
```

**Firebase handles:**
- User authentication (login/signup)
- Real-time chat (Firestore)
- File storage (profile images, workshop photos)

**Django handles:**
- Complex business logic
- Admin panel
- Analytics and reporting
- Custom API endpoints
- Database management (Workshops, Reviews, Service Requests)

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **garagemap-11a27**
3. Click **Project Settings** (⚙️) → **Service Accounts**
4. Click **Generate new private key**
5. Save as `backend/firebase-credentials.json`

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser

```bash
python manage.py createsuperuser
```

### 5. Run Django Server

```bash
python manage.py runserver 8000
```

Django will run on: **http://localhost:8000**

---

## 🔐 How Firebase Authentication Works

### Frontend (Next.js)

When users log in with Firebase, your frontend gets an **ID token**:

```typescript
// In Next.js
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();

// Send this token to Django API
fetch('http://localhost:8000/api/workshops/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Backend (Django)

The `FirebaseAuthenticationMiddleware` automatically:
1. Verifies the Firebase token
2. Creates/retrieves Django user
3. Attaches user to `request.user`

```python
# In your views, request.user is automatically set!
def my_view(request):
    workshop = Workshop.objects.create(
        owner=request.user,  # ← Firebase user
        name="My Workshop"
    )
```

---

## 📡 API Endpoints

### Available Endpoints:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/workshops/` | GET | List all workshops | No |
| `/api/workshops/` | POST | Create workshop | Yes |
| `/api/workshops/{id}/` | GET | Get workshop details | No |
| `/api/workshops/my_workshop/` | GET | Get my workshop | Yes |
| `/api/workshops/nearby/` | GET | Find nearby workshops | No |
| `/api/service-requests/` | GET | List service requests | Yes |
| `/api/service-requests/` | POST | Create service request | Yes |
| `/api/service-requests/{id}/accept/` | POST | Accept request (mechanics) | Yes |
| `/api/service-requests/{id}/complete/` | POST | Complete request | Yes |
| `/api/reviews/` | GET/POST | Workshop reviews | Yes (POST) |
| `/api/mechanics/` | GET | List all mechanics | No |

### Example API Calls:

#### Create Service Request:
```bash
POST http://localhost:8000/api/service-requests/
Headers:
  Authorization: Bearer <firebase-token>
  Content-Type: application/json

Body:
{
  "workshop_id": 1,
  "service_type": "emergency",
  "description": "Car broke down",
  "urgency": "emergency",
  "user_latitude": 12.9716,
  "user_longitude": 77.5946
}
```

#### Get My Workshop:
```bash
GET http://localhost:8000/api/workshops/my_workshop/
Headers:
  Authorization: Bearer <firebase-token>
```

---

## 🔧 Admin Panel

Access Django Admin at: **http://localhost:8000/admin**

Login with your superuser credentials.

Here you can:
- View all workshops
- Manage service requests
- Moderate reviews
- View user profiles
- Verify mechanics

---

## 🌐 Connecting Frontend to Django

Update your Next.js to call Django APIs:

```typescript
// lib/django-api.ts
import { getAuth } from 'firebase/auth';

const DJANGO_API = 'http://localhost:8000/api';

async function getAuthToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

export async function fetchWorkshops() {
  const token = await getAuthToken();
  const response = await fetch(`${DJANGO_API}/workshops/`, {
    headers: token ? {
      'Authorization': `Bearer ${token}`
    } : {}
  });
  return response.json();
}

export async function createServiceRequest(data: any) {
  const token = await getAuthToken();
  const response = await fetch(`${DJANGO_API}/service-requests/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

---

## 🎯 Use Cases

### When to use Firebase:
- ✅ User authentication
- ✅ Real-time chat
- ✅ File uploads (images)
- ✅ Real-time updates

### When to use Django:
- ✅ Complex queries (finding nearby mechanics)
- ✅ Business logic (acceptance workflows)
- ✅ Admin operations
- ✅ Analytics and reporting
- ✅ Data validation and integrity

---

## 📁 Project Structure

```
backend/
├── garagemap/              # Django project settings
│   ├── settings.py         # Main settings (with Firebase integration)
│   ├── firebase_auth.py    # Firebase authentication middleware
│   └── urls.py
├── api/                    # Main API app
│   ├── models.py           # Workshop, ServiceRequest, Review models
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API views
│   └── urls.py
├── manage.py
├── requirements.txt
└── firebase-credentials.json  # ⚠️ Add this (don't commit!)
```

---

## 🔒 Security Notes

1. **Never commit `firebase-credentials.json`** (in .gitignore)
2. In production:
   - Set `DEBUG = False`
   - Update `ALLOWED_HOSTS`
   - Use environment variables for secrets
   - Configure proper CORS origins

---

## 🚀 Next Steps

1. **Add Firebase credentials** (see setup step 2)
2. **Run migrations**: `python manage.py migrate`
3. **Create superuser**: `python manage.py createsuperuser`
4. **Start server**: `python manage.py runserver`
5. **Test API**: Visit http://localhost:8000/api/workshops/
6. **Admin panel**: Visit http://localhost:8000/admin

---

## 📞 Need Help?

- Django Docs: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup

Your Django backend is now integrated with Firebase! 🎉
