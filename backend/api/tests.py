from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Workshop


class ReviewSecurityTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner', password='pass')
        self.reviewer = User.objects.create_user(username='reviewer', password='pass')
        self.workshop = Workshop.objects.create(
            owner=self.owner,
            mechanic_name='Owner Mechanic',
            workshop_name='Owner Workshop',
            phone='1234567890',
            latitude=12.971600,
            longitude=77.594600,
            services=['car'],
        )

    def test_unauthenticated_cannot_create_review(self):
        response = self.client.post(
            '/api/reviews/',
            {'workshop_id': self.workshop.id, 'rating': 5, 'comment': 'Great'},
            format='json',
        )
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_authenticated_review_updates_workshop_rating(self):
        self.client.force_authenticate(user=self.reviewer)
        response = self.client.post(
            '/api/reviews/',
            {'workshop_id': self.workshop.id, 'rating': 4, 'comment': 'Good'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.workshop.refresh_from_db()
        self.assertEqual(float(self.workshop.rating), 4.0)
        self.assertEqual(self.workshop.reviews_count, 1)


class ServiceRequestApiTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(username='customer', password='pass')
        self.owner = User.objects.create_user(username='owner2', password='pass')
        self.workshop = Workshop.objects.create(
            owner=self.owner,
            mechanic_name='Owner Two',
            workshop_name='Workshop Two',
            phone='1234567891',
            latitude=13.000000,
            longitude=77.500000,
            services=['car'],
        )

    def test_create_service_request_uses_workshop_id_contract(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(
            '/api/service-requests/',
            {
                'workshop_id': self.workshop.id,
                'service_type': 'car',
                'description': 'Engine issue',
                'urgency': 'medium',
                'user_latitude': 12.971600,
                'user_longitude': 77.594600,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['workshop']['id'], self.workshop.id)
