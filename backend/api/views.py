from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
from decouple import config
import google.generativeai as genai
from .models import UserProfile, Workshop, ServiceRequest, Review
from .serializers import (
    UserSerializer, UserProfileSerializer, WorkshopSerializer,
    ServiceRequestSerializer, ReviewSerializer, MechanicSerializer
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False


class MeViewSet(viewsets.ViewSet):
    """Authenticated user's profile and related actions"""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={'firebase_uid': getattr(request.user, 'firebase_uid', '')}
        )
        return Response(UserProfileSerializer(profile).data)


class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=request.user)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Return workshops filtered by simple query params."""
        service_type = request.query_params.get('service_type')
        city = request.query_params.get('city')
        q = Q()
        if service_type:
            q &= Q(service_type=service_type)
        if city:
            q &= Q(city__iexact=city)
        items = Workshop.objects.filter(q)
        page = self.paginate_queryset(items)
        if page is not None:
            return self.get_paginated_response(self.serializer_class(page, many=True).data)
        return Response(self.serializer_class(items, many=True).data)

    @action(detail=False, methods=['get'])
    def my_workshop(self, request):
        """Return the workshop owned by the current user."""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        workshop = Workshop.objects.filter(owner=request.user).first()
        if workshop:
            return Response(self.serializer_class(workshop).data)
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.select_related('user', 'workshop').all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=request.user, status='pending')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        sr = self.get_object()
        if sr.workshop.owner != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        sr.status = 'accepted'
        sr.save(update_fields=['status'])
        return Response(self.serializer_class(sr).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        sr = self.get_object()
        if sr.workshop.owner != request.user:
            return Response({'detail': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        sr.status = 'completed'
        sr.save(update_fields=['status'])
        return Response(self.serializer_class(sr).data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'workshop').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=request.user)


class MechanicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.filter(user_type='mechanic').select_related('user')
    serializer_class = MechanicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        user_lat = self.request.query_params.get('user_lat')
        user_lon = self.request.query_params.get('user_lon')
        if user_lat and user_lon:
            try:
                user_lat = float(user_lat)
                user_lon = float(user_lon)
                # Approximate distance using Euclidean (for small areas, km approx)
                # Distance in km: sqrt((lat_diff * 111)^2 + (lon_diff * 111 * cos(lat))^2)
                # But for simplicity, order by lat and lon diff
                queryset = queryset.extra(
                    select={'distance': 'SQRT(POW((latitude - %s) * 111, 2) + POW((longitude - %s) * 111, 2))'},
                    select_params=[user_lat, user_lon],
                    order_by=['distance']
                ).filter(latitude__isnull=False, longitude__isnull=False)
            except ValueError:
                pass
        return queryset


# Configure Gemini AI
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ai_chatbot(request):
    """
    AI-powered chatbot for customer assistance using Google Gemini.
    Helps customers with car issues, mechanic recommendations, and platform navigation.
    """
    try:
        user_message = request.data.get('message', '')
        conversation_history = request.data.get('history', [])
        
        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not GEMINI_API_KEY:
            return Response(
                {'error': 'AI service is not configured. Please contact support.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # System context for the chatbot
        system_context = """You are GarageMap AI Assistant, a helpful and friendly chatbot for GarageMap - a platform connecting customers with mechanics and auto repair workshops.

Your role:
- Help customers understand car problems and suggest possible issues
- Recommend appropriate services (oil change, brake repair, AC service, tire replacement, etc.)
- Guide users on how to find and book mechanics
- Answer questions about the platform
- Provide estimated urgency levels for car issues

Key services available on GarageMap:
- Car Service (general maintenance)
- Bike Service
- Truck Service
- Emergency Roadside Assistance
- Towing
- Brake Repair
- Engine Diagnostics
- AC Repair
- Tire Services
- Oil Change
- Battery Replacement

Guidelines:
1. Be concise and helpful (2-4 sentences max)
2. If describing a car problem, suggest likely causes and urgency (low/medium/high/emergency)
3. Always encourage users to book a mechanic for proper diagnosis
4. Be friendly and professional
5. If unsure, admit it and suggest contacting a mechanic directly

Example interactions:
User: "My car makes a grinding noise when I brake"
You: "That grinding noise is likely worn brake pads or damaged rotors - this is a high-priority safety issue! I recommend booking a brake specialist immediately through our dashboard. Would you like help finding mechanics who specialize in brake repairs?"

User: "How do I book a mechanic?"
You: "It's easy! Go to your dashboard, browse available mechanics, filter by service type, and click 'Book Now' on your preferred workshop. You can also call them directly or request emergency assistance if needed."
"""
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Build conversation with context
        chat_messages = [system_context]
        
        # Add conversation history
        for msg in conversation_history[-10:]:  # Keep last 10 messages for context
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                chat_messages.append(f"User: {content}")
            else:
                chat_messages.append(f"Assistant: {content}")
        
        # Add current message
        chat_messages.append(f"User: {user_message}")
        
        # Generate response
        full_prompt = "\n\n".join(chat_messages)
        response = model.generate_content(full_prompt)
        
        ai_response = response.text
        
        return Response({
            'message': ai_response,
            'success': True
        })
        
    except Exception as e:
        return Response(
            {'error': f'AI service error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
