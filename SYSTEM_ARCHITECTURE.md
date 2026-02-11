# GarageMap - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Next.js 14 Frontend (TypeScript)           │    │
│  │                                                     │    │
│  │  • React Components (50+)                          │    │
│  │  • Context API (State Management)                  │    │
│  │  • Tailwind CSS (Styling)                          │    │
│  │  • Custom Hooks                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Firebase   │ │    Django    │ │ OpenStreetMap│
    │   Services   │ │   Backend    │ │  Nominatim   │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔥 Firebase Services Layer

```
┌─────────────────────────────────────────────────────────┐
│                    FIREBASE PLATFORM                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     Auth     │  │  Firestore   │  │   Storage    │ │
│  │              │  │              │  │              │ │
│  │ • Email/Pass │  │ • Users      │  │ • Profile    │ │
│  │ • Google     │  │ • Mechanics  │  │   Images     │ │
│  │   OAuth      │  │ • Requests   │  │ • Workshop   │ │
│  │ • JWT Tokens │  │ • Real-time  │  │   Photos     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🐍 Django Backend Layer

```
┌─────────────────────────────────────────────────────────┐
│                   DJANGO REST API                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              API Endpoints                        │  │
│  │                                                   │  │
│  │  • /api/chat/          → AI Chatbot             │  │
│  │  • /api/mechanics/     → Mechanic CRUD          │  │
│  │  • /api/requests/      → Service Requests       │  │
│  │  • /api/reviews/       → Reviews & Ratings      │  │
│  │  • /admin/             → Django Admin Panel     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           External Integrations                   │  │
│  │                                                   │  │
│  │  • Google Gemini API  → AI Responses            │  │
│  │  • Firebase Admin SDK → Auth Verification       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS APPLICATION                     │
│                                                          │
│  src/                                                    │
│  ├── app/                    (App Router)               │
│  │   ├── page.tsx            → Landing Page             │
│  │   ├── login/              → Authentication           │
│  │   ├── signup/             → Registration             │
│  │   ├── dashboard/          → Customer Dashboard       │
│  │   ├── mechanic-dashboard/ → Mechanic Dashboard       │
│  │   ├── map-workshop/       → Workshop Search          │
│  │   ├── request/[id]/       → Service Request Form     │
│  │   └── geocoding-test/     → Testing Tool             │
│  │                                                       │
│  ├── components/             (Reusable Components)      │
│  │   ├── Navbar.tsx          → Navigation Bar           │
│  │   ├── Footer.tsx          → Footer Component         │
│  │   ├── SimpleMap.tsx       → Map Component            │
│  │   └── ChatWidget.tsx      → AI Chatbot Widget        │
│  │                                                       │
│  ├── contexts/               (State Management)         │
│  │   └── AuthContext.tsx     → User Authentication      │
│  │                                                       │
│  └── lib/                    (Utilities)                │
│      ├── firebase.ts         → Firebase Config          │
│      ├── firestore.ts        → Database Operations      │
│      ├── geocoding.ts        → Location Services        │
│      ├── django-api.ts       → Backend API Calls        │
│      └── api.ts              → Helper Functions         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Service Request

```
┌──────────────────────────────────────────────────────────────┐
│                    USER JOURNEY FLOW                          │
└──────────────────────────────────────────────────────────────┘

1. USER ACTION
   │
   ├─→ Clicks "Request Service" button
   │
   ▼

2. FRONTEND (React Component)
   │
   ├─→ Validates form data (TypeScript)
   ├─→ Gets user location (Geolocation API)
   ├─→ Reverse geocodes to address (OpenStreetMap)
   │
   ▼

3. AUTHENTICATION CHECK
   │
   ├─→ Verifies user is logged in (AuthContext)
   ├─→ Gets Firebase JWT token
   │
   ▼

4. FIRESTORE WRITE
   │
   ├─→ Creates request document
   │   {
   │     userId: "abc123",
   │     mechanicId: "xyz789",
   │     serviceType: "brake",
   │     status: "pending",
   │     urgency: "medium",
   │     description: "Squeaking noise",
   │     createdAt: Timestamp
   │   }
   │
   ▼

5. SECURITY RULES CHECK
   │
   ├─→ Firestore validates:
   │   • User is authenticated ✓
   │   • User owns this request ✓
   │   • Data format is valid ✓
   │
   ▼

6. REAL-TIME UPDATE
   │
   ├─→ Mechanic's dashboard listener triggers
   ├─→ New request appears in "Pending" tab
   │
   ▼

7. UI UPDATE
   │
   ├─→ Success message shown
   ├─→ Redirect to dashboard
   ├─→ Request appears in customer's list
   │
   ▼

8. COMPLETE ✓
```

---

## 🗺️ Location-Based Search Flow

```
┌──────────────────────────────────────────────────────────┐
│              LOCATION SEARCH ARCHITECTURE                 │
└──────────────────────────────────────────────────────────┘

1. USER CLICKS "Use My Location"
   │
   ▼
2. BROWSER GEOLOCATION API
   │
   ├─→ Requests permission
   ├─→ Gets GPS coordinates
   │   (latitude: 11.8663, longitude: 75.3660)
   │
   ▼
3. REVERSE GEOCODING
   │
   ├─→ Calls OpenStreetMap Nominatim API
   ├─→ Converts coordinates to place name
   │   "Kozhikode, Kerala, India"
   │
   ▼
4. FETCH MECHANICS
   │
   ├─→ Query Firestore for all mechanics
   ├─→ Get mechanic locations
   │
   ▼
5. DISTANCE CALCULATION
   │
   ├─→ For each mechanic:
   │   • Calculate distance using Haversine formula
   │   • Store distance in state
   │
   ▼
6. FILTERING & SORTING
   │
   ├─→ Filter by search term
   ├─→ Filter by service type
   ├─→ Sort by distance or rating
   │
   ▼
7. DISPLAY RESULTS
   │
   ├─→ Show on map with markers
   ├─→ Show in list with distances
   │   "2.3 km away"
   │
   ▼
8. USER SELECTS MECHANIC ✓
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                      │
└──────────────────────────────────────────────────────────┘

SIGNUP FLOW:
───────────
User fills form → Firebase Auth creates account
                → Store user data in Firestore
                → Generate JWT token
                → Store in AuthContext
                → Redirect based on userType
                  ├─→ Customer → /dashboard
                  └─→ Mechanic → /mechanic-dashboard

LOGIN FLOW:
──────────
User enters credentials → Firebase Auth verifies
                        → Fetch user data from Firestore
                        → Get userType
                        → Generate JWT token
                        → Store in AuthContext
                        → Redirect to appropriate dashboard

GOOGLE OAUTH FLOW:
─────────────────
User clicks "Sign in with Google" → Firebase OAuth popup
                                   → User authorizes
                                   → Firebase creates/updates account
                                   → Check if user exists in Firestore
                                   → If new: Create user document
                                   → Generate JWT token
                                   → Redirect to dashboard

PROTECTED ROUTE:
───────────────
User visits protected page → Check AuthContext
                           → If not logged in: Redirect to /login
                           → If logged in: Allow access
                           → If wrong role: Redirect to correct dashboard
```

---

## 💬 AI Chatbot Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   AI CHATBOT FLOW                         │
└──────────────────────────────────────────────────────────┘

1. USER TYPES MESSAGE
   │
   ▼
2. FRONTEND (ChatWidget Component)
   │
   ├─→ Add message to chat history
   ├─→ Show loading indicator
   │
   ▼
3. API CALL TO DJANGO
   │
   ├─→ POST /api/chat/
   │   Body: { message: "My car won't start" }
   │
   ▼
4. DJANGO BACKEND
   │
   ├─→ Receives message
   ├─→ Adds system context:
   │   "You are a helpful assistant for GarageMap,
   │    a platform connecting users with mechanics..."
   │
   ▼
5. GOOGLE GEMINI API
   │
   ├─→ Send message with context
   ├─→ Gemini processes request
   ├─→ Generates response
   │
   ▼
6. RESPONSE PROCESSING
   │
   ├─→ Django receives AI response
   ├─→ Formats response
   ├─→ Returns to frontend
   │
   ▼
7. FRONTEND UPDATE
   │
   ├─→ Add AI response to chat
   ├─→ Hide loading indicator
   ├─→ Scroll to bottom
   │
   ▼
8. USER SEES RESPONSE ✓
```

---

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                  FIRESTORE COLLECTIONS                   │
└─────────────────────────────────────────────────────────┘

USERS COLLECTION
────────────────
users/{userId}
  ├─ uid: string
  ├─ email: string
  ├─ displayName: string
  ├─ userType: "customer" | "mechanic" | "admin"
  ├─ photoURL: string
  └─ createdAt: Timestamp

MECHANICS COLLECTION
───────────────────
mechanics/{mechanicId}
  ├─ id: string
  ├─ userId: string (→ links to users collection)
  ├─ name: string
  ├─ workshop_name: string
  ├─ phone: string
  ├─ latitude: number
  ├─ longitude: number
  ├─ services: string[]
  ├─ rating: number
  ├─ reviews_count: number
  ├─ is_open: boolean
  └─ photo: string

REQUESTS COLLECTION
──────────────────
requests/{requestId}
  ├─ id: string
  ├─ userId: string (→ customer)
  ├─ mechanicId: string (→ mechanic)
  ├─ mechanicUserId: string (→ for notifications)
  ├─ userName: string
  ├─ mechanicName: string
  ├─ serviceType: string
  ├─ status: "pending" | "accepted" | "completed" | "rejected"
  ├─ urgency: "low" | "medium" | "high"
  ├─ description: string
  ├─ createdAt: Timestamp
  └─ updatedAt: Timestamp

INDEXES
───────
• (mechanicUserId, status) → For mechanic dashboard queries
• (userId, createdAt) → For customer request history
• (status, createdAt) → For admin queries
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DEPLOYMENT SETUP                        │
└─────────────────────────────────────────────────────────┘

FRONTEND (Vercel)
────────────────
GitHub Repo → Vercel
            → Auto-deploy on push to main
            → Edge network (CDN)
            → Environment variables
            → HTTPS automatic
            → Custom domain support

BACKEND (Render)
───────────────
GitHub Repo → Render
            → Auto-deploy on push
            → Gunicorn server
            → Environment variables
            → HTTPS automatic
            → Health checks

FIREBASE (Google Cloud)
──────────────────────
• Authentication → Global
• Firestore → Multi-region
• Storage → Regional
• Always available
• Auto-scaling

DOMAIN FLOW
──────────
User → DNS
     → Vercel Edge Network (Frontend)
     → Render (Backend API)
     → Firebase (Database/Auth)
```

---

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────┐
│              REACT STATE ARCHITECTURE                    │
└─────────────────────────────────────────────────────────┘

GLOBAL STATE (Context API)
─────────────────────────
AuthContext
  ├─ currentUser: User | null
  ├─ userType: "customer" | "mechanic" | "admin"
  ├─ loading: boolean
  ├─ login(email, password)
  ├─ signup(email, password, userData)
  ├─ logout()
  └─ loginWithGoogle()

LOCAL STATE (useState)
────────────────────
Component-level state:
  ├─ Form inputs
  ├─ Loading states
  ├─ Error messages
  ├─ UI toggles
  └─ Temporary data

REAL-TIME STATE (Firestore Listeners)
────────────────────────────────────
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "requests"),
    (snapshot) => {
      // Update state when data changes
    }
  );
  return unsubscribe;
}, []);
```

---

## 🎯 Key Design Patterns

```
┌─────────────────────────────────────────────────────────┐
│                  DESIGN PATTERNS USED                    │
└─────────────────────────────────────────────────────────┘

1. CONTEXT PATTERN
   → Global state management (AuthContext)

2. CUSTOM HOOKS
   → Reusable logic (useAuth, useFirestore)

3. COMPONENT COMPOSITION
   → Reusable UI components (Navbar, Footer)

4. PROTECTED ROUTES
   → Authentication guards

5. OPTIMISTIC UI
   → Update UI before server response

6. ERROR BOUNDARIES
   → Graceful error handling

7. LAZY LOADING
   → Code splitting for performance

8. REPOSITORY PATTERN
   → Data access layer (firestore.ts, api.ts)
```

---

**This architecture demonstrates:**
✅ Scalable design
✅ Separation of concerns
✅ Modern best practices
✅ Production-ready structure
✅ Security-first approach
