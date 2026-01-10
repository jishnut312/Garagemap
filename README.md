# 🚗 GarageMap

> **Connecting vehicle owners with trusted mechanics and garages instantly**

A full-stack web platform that revolutionizes how people find and book automotive services. Built with modern technologies and designed for real-world use.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://www.djangoproject.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## 🎯 The Problem

Finding a reliable mechanic or garage is frustrating:
- ❌ Time-consuming phone calls
- ❌ Uncertainty about availability
- ❌ Lack of transparent reviews
- ❌ No way to compare nearby options
- ❌ Difficulty describing car problems

## 💡 The Solution

GarageMap makes automotive care as easy as ordering food:
- ✅ **Real-time map** showing nearby workshops
- ✅ **Instant booking** without phone calls
- ✅ **AI chatbot** to help describe issues
- ✅ **Verified reviews** from real customers
- ✅ **Service tracking** from request to completion

---

## ✨ Key Features

### For Customers
- 🗺️ **Interactive Map Search** - Find workshops by location, service type, and ratings
- 📱 **Service Requests** - Send detailed requests with urgency levels
- 🤖 **AI Assistant** - Get help describing car problems and finding solutions
- 📊 **Dashboard** - Track all your service requests in one place
- ⭐ **Reviews & Ratings** - Make informed decisions based on real feedback

### For Mechanics
- 🔧 **Workshop Profile** - Showcase services, photos, and expertise
- 📬 **Request Management** - Accept/reject service requests efficiently
- 📈 **Dashboard** - Manage all incoming requests and customer communications
- 🏆 **Reputation Building** - Build trust through verified reviews

### Platform Features
- 🔐 **Secure Authentication** - Email/password and Google OAuth
- 🌍 **Location-Based** - Automatic detection and distance calculation
- 💬 **Real-time Updates** - Firebase-powered live data sync
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Premium UI/UX** - Modern design with smooth animations

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP + ScrollTrigger
- **Maps:** Google Maps API + Leaflet
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** Django 5.0
- **API:** Django REST Framework
- **Authentication:** Firebase Admin SDK
- **Database:** Firebase Firestore
- **AI:** Google Gemini API
- **Server:** Gunicorn

### Infrastructure
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Real-time:** Firebase Realtime capabilities
- **Deployment:** Vercel (Frontend) + Render (Backend)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Next.js Frontend                  │
│  (React, TypeScript, Tailwind CSS)         │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│  Firebase   │  │   Django     │
│             │  │   Backend    │
│ - Auth      │  │              │
│ - Firestore │  │ - REST API   │
│ - Storage   │  │ - Admin      │
│ - Realtime  │  │ - AI Chat    │
└─────────────┘  └──────────────┘
```

**Hybrid Approach:**
- **Firebase** handles: Authentication, real-time data, file storage
- **Django** handles: Complex business logic, admin operations, AI integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Firebase account
- Google Maps API key
- Gemini API key (for AI chatbot)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Add your environment variables to .env.local
# See frontend/README.md for details

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add Firebase credentials
# Download from Firebase Console → Project Settings → Service Accounts
# Save as: backend/firebase-credentials.json

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Visit [http://localhost:8000/admin](http://localhost:8000/admin)

### Detailed Setup Guides
- 📖 [Frontend Setup](frontend/README.md)
- 📖 [Backend Setup](backend/README.md)
- 🔥 [Firebase Configuration](FIRESTORE_SETUP_GUIDE.md)
- 🗺️ [Google Maps Setup](frontend/GOOGLE_MAPS_SETUP.md)
- 🤖 [AI Chatbot Setup](AI_CHATBOT_SETUP.md)

---

## 📸 Screenshots

> **Note:** Add screenshots here to showcase your application

### Landing Page
![Landing Page](./screenshots/landing-page.png)

### Map Workshop Interface
![Map Workshop](./screenshots/map-workshop.png)

### Mechanic Dashboard
![Mechanic Dashboard](./screenshots/mechanic-dashboard.png)

### AI Chatbot
![AI Chatbot](./screenshots/ai-chatbot.png)

---

## 🎥 Demo Video

> **Coming Soon:** Link to demo video

---

## 📁 Project Structure

```
garagemap/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   └── lib/             # Utilities & configs
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Django application
│   ├── garagemap/          # Project settings
│   ├── api/                # Main API app
│   ├── manage.py
│   └── requirements.txt
│
├── AI_CHATBOT_SETUP.md     # AI integration guide
├── FIRESTORE_SETUP_GUIDE.md # Database setup
└── README.md               # This file
```

---

## 🔑 Key Features in Detail

### 1. Smart Workshop Discovery
- Real-time location detection
- Filter by service type (car, bike, truck, emergency)
- Sort by distance, rating, or availability
- Interactive map with custom markers
- Detailed workshop profiles

### 2. Service Request System
- Dynamic forms based on workshop services
- Urgency levels (low, medium, high, emergency)
- Automatic location capture
- Status tracking (pending → accepted → completed)
- Request history

### 3. AI-Powered Assistance
- Context-aware chatbot using Gemini API
- Helps users describe car problems
- Suggests relevant workshops
- Answers common automotive questions
- Idle-time trigger for proactive help

### 4. Dual Dashboard System
- **Customer Dashboard:** View requests, find workshops, track services
- **Mechanic Dashboard:** Manage requests, update profile, view analytics

### 5. Authentication & Security
- Firebase Authentication
- Email/password signup
- Google OAuth integration
- Password reset functionality
- Protected routes
- Secure token-based API calls

---

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend
cd backend
python manage.py test
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with auto-build

See deployment guides in respective README files.

---

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication system
- [x] Workshop discovery with maps
- [x] Service request management
- [x] AI chatbot integration
- [x] Dual dashboard system
- [x] Real-time updates
- [x] Responsive design

### 🚧 In Progress
- [ ] Payment integration
- [ ] Push notifications
- [ ] Advanced analytics

### 📋 Planned
- [ ] Mobile app (React Native)
- [ ] Video call support
- [ ] Parts marketplace
- [ ] Subscription plans
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend infrastructure
- Google for Maps and Gemini APIs
- The open-source community

---

## 📞 Support

If you have any questions or need help setting up the project:
- 📧 Email: your.email@example.com
- 💬 Open an issue on GitHub
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐️!

---

**Built with ❤️ using Next.js, Django, and Firebase**
