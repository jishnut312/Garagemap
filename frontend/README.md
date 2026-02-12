# GarageMap Frontend

A Next.js frontend application for finding and requesting services from nearby mechanics and auto repair shops.

## Features

✅ **User Authentication** (Firebase integration ready)
- Email/password signup and login
- Google OAuth integration
- Password reset functionality
- User profile management

✅ **Mechanic Discovery**
- Search mechanics by location and service type
- Filter by rating, distance, and availability
- View mechanic profiles with reviews and ratings
- Real-time location detection

✅ **Service Requests**
- Send service requests to mechanics
- Track request status (pending/accepted/completed)
- Specify urgency and problem description
- Location-based service requests

✅ **Interactive Dashboard**
- Modern, responsive UI with Tailwind CSS
- Dark mode support
- Mobile-friendly design
- Real-time updates

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (ready to configure)
- **Maps**: Google Maps/Leaflet integration ready
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template:
```bash
cp env.example .env.local
```

Fill in your configuration values:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Google Maps API (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── request/          # Service request pages
│   └── page.tsx          # Homepage
├── components/           # Reusable components
│   └── SimpleMap.tsx    # Map component
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
└── lib/                 # Utilities and configurations
    ├── api.ts          # API client and types
    └── firebase.ts     # Firebase configuration
```

## API Integration

The frontend is designed to work with a Django backend. Key API endpoints:

- `GET /api/mechanics/` - Get all mechanics
- `GET /api/mechanics/nearby/` - Get nearby mechanics
- `POST /api/service-requests/` - Create service request
- `GET /api/service-requests/` - Get service requests

## Features in Detail

### Authentication System
- Mock authentication is implemented for development
- Ready to integrate with Firebase Auth
- Supports email/password and Google OAuth
- Protected routes and user context

### Mechanic Search
- Location-based search with geolocation API
- Service type filtering (car, bike, truck, emergency)
- Rating and availability filters
- Distance calculation and sorting

### Service Requests
- Dynamic form based on mechanic services
- Urgency levels and detailed descriptions
- Location detection and address input
- Request status tracking

### Responsive Design
- Mobile-first approach
- Dark mode support
- Modern UI with smooth animations
- Accessible components

## Development Notes

### Current State
- All core features are implemented with mock data
- Authentication uses localStorage for development
- Map component is a placeholder (ready for Google Maps/Leaflet)
- API calls are mocked but structured for real backend integration

### Next Steps
1. Install dependencies: `npm install`
2. Configure Firebase authentication
3. Connect to Django backend API
4. Integrate Google Maps or Leaflet
5. Add real-time notifications
6. Implement payment processing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Install dependencies
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test on mobile and desktop
5. Submit pull request

## License

This project is part of the GarageMap application suite.
