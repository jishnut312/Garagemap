from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth.models import User
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
