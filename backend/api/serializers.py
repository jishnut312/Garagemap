import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Workshop, ServiceRequest, Review


class Base64ImageField(serializers.ImageField):
    """
    A Django REST framework field for handling image-uploads through raw post data.
    It uses base64 for encoding and decoding the contents of the file.
    """
    def to_internal_value(self, data):
        from django.core.files.base import ContentFile
        import base64
        import six
        import uuid

        # Check if this is a base64 string
        if isinstance(data, six.string_types):
            # Check if the base64 string is in the "data:image/..." format
            if 'data:' in data and ';base64,' in data:
                # Break out the header from the base64 content
                header, data = data.split(';base64,')

            # Try to decode the file. Return validation error if it fails.
            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')

            # Generate file name:
            file_name = str(uuid.uuid4())[:12] # 12 characters are more than enough.
            # Get the file extension:
            file_extension = self.get_file_extension(file_name, decoded_file)
            complete_file_name = "%s.%s" % (file_name, file_extension, )
            data = ContentFile(decoded_file, name=complete_file_name)

        return super(Base64ImageField, self).to_internal_value(data)

    def get_file_extension(self, file_name, decoded_file):
        import imghdr
        extension = imghdr.what(file_name, decoded_file)
        extension = "jpg" if extension == "jpeg" else extension
        return extension


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_image = Base64ImageField(max_length=None, use_url=True, required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'firebase_uid', 'user_type', 'phone', 'profile_image', 'created_at']


class WorkshopSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    # Map 'photo' from frontend to 'image' in backend, handling Base64
    photo = Base64ImageField(source='image', max_length=None, use_url=True, required=False, allow_null=True)
    
    class Meta:
        model = Workshop
        fields = [
            'id', 'owner', 'mechanic_name', 'workshop_name', 'description', 
            'phone', 'email', 'address', 'city', 'state', 'pincode', 
            'latitude', 'longitude', 'services', 'photo', 'is_open', 
            'availability', 'rating', 'reviews_count', 'created_at'
        ]


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


class MechanicSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    workshops = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'user_type', 'phone', 'profile_image', 'latitude', 'longitude', 'workshops', 'created_at']

    def get_workshops(self, obj):
        workshops = Workshop.objects.filter(owner=obj.user)
        return WorkshopSerializer(workshops, many=True).data


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
