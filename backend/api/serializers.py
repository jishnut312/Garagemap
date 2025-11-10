from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Workshop, ServiceRequest, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'firebase_uid', 'user_type', 'phone', 'profile_image', 'created_at']


class WorkshopSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Workshop
        fields = '__all__'


class ServiceRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    workshop = WorkshopSerializer(read_only=True)
    workshop_id = serializers.PrimaryKeyRelatedField(
        queryset=Workshop.objects.all(), source='workshop', write_only=True
    )

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'user', 'workshop', 'workshop_id', 'service_type', 'description', 'urgency', 'status',
            'user_latitude', 'user_longitude', 'user_address', 'distance_km',
            'created_at', 'accepted_at', 'completed_at', 'updated_at'
        ]
        read_only_fields = ['status', 'distance_km', 'created_at', 'accepted_at', 'completed_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    workshop = WorkshopSerializer(read_only=True)
    workshop_id = serializers.PrimaryKeyRelatedField(
        queryset=Workshop.objects.all(), source='workshop', write_only=True
    )

    class Meta:
        model = Review
        fields = ['id', 'user', 'workshop', 'workshop_id', 'service_request', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']
