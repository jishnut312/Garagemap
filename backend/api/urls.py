from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MeViewSet, WorkshopViewSet, ServiceRequestViewSet, ReviewViewSet, MechanicViewSet

router = DefaultRouter()
router.register(r'me', MeViewSet, basename='me')
router.register(r'workshops', WorkshopViewSet)
router.register(r'service-requests', ServiceRequestViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'mechanics', MechanicViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
