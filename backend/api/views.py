from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.db.models import Q
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

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        firebase_uid = getattr(request, 'firebase_user', {}).get('uid', request.user.username)
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={'firebase_uid': firebase_uid}
        )
        if request.method == 'PATCH':
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

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

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(Q(user=user) | Q(workshop__owner=user)).distinct()

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        review.workshop.update_rating()
    
    @action(detail=False, methods=['get'])
    def workshop_reviews(self, request):
        """Get all reviews for a specific workshop"""
        workshop_id = request.query_params.get('workshop_id')
        if not workshop_id:
            return Response(
                {'error': 'workshop_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reviews = Review.objects.filter(workshop_id=workshop_id).select_related('user', 'workshop')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


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
@permission_classes([permissions.IsAuthenticated])
@throttle_classes([UserRateThrottle])
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
        system_context = """You are a professional vehicle support assistant for GarageMap, a platform connecting vehicle owners with mechanics.

Your role:
- Help users identify and understand vehicle issues calmly and clearly
- Ask clarifying questions before making recommendations
- Provide structured next steps (book service, find mechanic, emergency contact)
- Never declare high urgency unless the user confirms danger (smoke, fire, brake failure)

Tone Guidelines:
- Professional and reassuring (users may be stressed)
- Use simple language, avoid jargon unless necessary
- Be concise (2-3 sentences per response)
- Acknowledge uncertainty when appropriate

Available Services on GarageMap:
- General Maintenance (Oil Change, Tire Rotation, Battery Check)
- Brake Services (Pad Replacement, Rotor Resurfacing)
- Engine Diagnostics (Check Engine Light, Performance Issues)
- AC/Heating Repair
- Transmission Services
- Towing & Roadside Assistance
- Emergency Services (24/7 for critical issues)

Response Structure:
1. Acknowledge the issue
2. Ask 1-2 clarifying questions if needed
3. Suggest likely causes (if enough info)
4. Recommend next action: "I recommend booking [service type] through our platform" or "This may require immediate attention - use our emergency service"

Example Interactions:

User: "My car is making a weird noise"
You: "I understand that's concerning. Can you describe when the noise happens? For example, is it when you brake, accelerate, or turn? Also, what does it sound like - grinding, squealing, or knocking?"

User: "My brakes are squeaking"
You: "Squeaking brakes often indicate worn brake pads, though it could also be dust or moisture. How long has this been happening? Does it occur every time you brake or only sometimes?"

User: "Check engine light is on"
You: "The check engine light can indicate various issues, from minor sensor problems to more serious concerns. Has the car's performance changed (rough idle, reduced power, unusual sounds)? I recommend booking an Engine Diagnostic service to identify the exact cause."

User: "My car won't start"
You: "Let's narrow this down. When you turn the key, what happens? Do you hear clicking sounds, does the engine crank but not start, or is there no response at all? This will help determine if it's the battery, starter, or fuel system."

User: "There's smoke coming from the hood"
You: "Please pull over safely immediately if you haven't already. Smoke from the hood can indicate overheating or a serious issue. Do not open the hood if you see flames. I recommend using our Emergency Roadside Assistance right away."

Never:
- Diagnose definitively without enough information
- Use alarming language unless truly dangerous
- Recommend specific mechanics (let the platform match them)
- Provide repair cost estimates
- Include meta-commentary, self-corrections, or internal reasoning in your responses (e.g., "*(Self-Correction: ...)*")
- Show your thinking process - only provide the final, polished response
"""
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-flash-latest')
        
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
