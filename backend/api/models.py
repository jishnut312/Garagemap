from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('mechanic', 'Mechanic'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    firebase_uid = models.CharField(max_length=255, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"


class Workshop(models.Model):
    """
    Workshop/Mechanic profile model.
    Represents a mechanic's workshop with location, services, and availability.
    """
    
    AVAILABILITY_CHOICES = [
        ('available', 'Available'),
        ('busy', 'Busy'),
        ('offline', 'Offline'),
    ]

    # Owner relationship
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshops')
    
    # Personal/Workshop Information
    mechanic_name = models.CharField(max_length=200, help_text="Name of the mechanic")
    workshop_name = models.CharField(max_length=200, help_text="Name of the workshop")
    description = models.TextField(blank=True, help_text="Brief description of services and specialties")
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    # Location
    address = models.TextField(blank=True, help_text="Full address of the workshop")
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Services - stored as JSON array: ['car', 'bike', 'truck', 'emergency', 'towing', 'inspection']
    services = models.JSONField(
        default=list,
        help_text="Array of services offered: car, bike, truck, emergency, towing, inspection"
    )

    # Media
    photo = models.URLField(max_length=500, blank=True, help_text="Profile photo URL")
    image = models.ImageField(upload_to='workshops/', blank=True, null=True, help_text="Uploaded image file")

    # Status and Availability
    is_open = models.BooleanField(default=True, help_text="Whether the workshop is currently open for business")
    availability = models.CharField(
        max_length=20, 
        choices=AVAILABILITY_CHOICES, 
        default='available',
        help_text="Current availability status"
    )
    
    # Ratings and Reviews
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    reviews_count = models.IntegerField(default=0, help_text="Total number of reviews")

    # Verification
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-rating', '-created_at']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_open', 'availability']),
            models.Index(fields=['-rating']),
        ]

    def __str__(self):
        return f"{self.workshop_name} - {self.mechanic_name}"

    def update_rating(self):
        """Calculate and update the average rating based on reviews"""
        from django.db.models import Avg
        avg_rating = self.reviews.aggregate(Avg('rating'))['rating__avg']
        if avg_rating is not None:
            self.rating = round(avg_rating, 2)
            self.reviews_count = self.reviews.count()
            self.save(update_fields=['rating', 'reviews_count'])


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('emergency', 'Emergency'),
    ]

    # Service types - can accept any value from Workshop.services
    SERVICE_TYPE_CHOICES = [
        ('car', 'Car Repair'),
        ('bike', 'Bike Repair'),
        ('truck', 'Truck Repair'),
        ('emergency', 'Emergency Service'),
        ('towing', 'Towing Service'),
        ('inspection', 'Vehicle Inspection'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_requests')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='service_requests')

    # Request details
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    description = models.TextField()
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Location (user's current location)
    user_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    user_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    user_address = models.TextField(blank=True)

    # Distance
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Request #{self.id} - {self.user.username} to {self.workshop.workshop_name}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='reviews')
    service_request = models.OneToOneField(
        ServiceRequest,
        on_delete=models.CASCADE,
        related_name='review',
        blank=True,
        null=True
    )

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review #{self.id} for {self.workshop.workshop_name}"
