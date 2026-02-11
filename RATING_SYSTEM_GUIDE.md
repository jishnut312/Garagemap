# Rating System Implementation Guide

## Overview
The GarageMap platform now includes a comprehensive rating system that allows customers to rate mechanics and garages after service completion. This feature helps build trust and provides valuable feedback for service providers.

## How to Give a Rating

### For Customers:

1. **Complete a Service Request**
   - Book a service with a mechanic through the dashboard
   - Wait for the mechanic to accept and complete the service
   - The request status will change to "Completed"

2. **Access the Rating Option**
   - Go to your **Dashboard** (`/dashboard`)
   - Look for completed service requests in the "Your Active Requests" section
   - Completed requests will show a yellow **"Rate Service"** button

3. **Submit Your Rating**
   - Click the **"Rate Service"** button
   - A rating modal will appear with:
     - **Star Rating**: Click on 1-5 stars to rate the service
       - ⭐ = Poor
       - ⭐⭐ = Fair
       - ⭐⭐⭐ = Good
       - ⭐⭐⭐⭐ = Very Good
       - ⭐⭐⭐⭐⭐ = Excellent
     - **Comment Box**: (Optional) Share your experience in detail
   - Click **"Submit Rating"** to save your review

4. **What Happens Next**
   - Your rating is saved to the database
   - The mechanic's/garage's average rating is automatically updated
   - Other customers can see the updated rating when browsing mechanics

## Features

### Customer Features:
- ⭐ **Interactive Star Rating**: Hover and click to select 1-5 stars
- 💬 **Optional Comments**: Share detailed feedback about your experience
- 🎨 **Beautiful UI**: Smooth animations and modern design
- ✅ **One-Click Submit**: Quick and easy rating process

### Mechanic/Garage Features:
- 📊 **Automatic Rating Updates**: Average rating updates instantly when customers submit reviews
- 🔢 **Review Count**: Total number of reviews is tracked
- 🌟 **Rating Display**: Ratings are shown on mechanic cards in the dashboard

## Technical Details

### Backend (Django):
- **Model**: `Review` model stores ratings and comments
- **API Endpoint**: `POST /api/reviews/` to create a review
- **Auto-Update**: Workshop rating automatically recalculates when a review is created
- **Fields**:
  - `workshop_id`: ID of the workshop being rated
  - `rating`: Integer from 1-5
  - `comment`: Optional text feedback
  - `service_request`: Optional link to the service request

### Frontend (Next.js):
- **Component**: `RatingModal.tsx` - Reusable rating modal
- **Integration**: Dashboard page shows "Rate Service" button for completed requests
- **API Client**: `django-api.ts` handles API communication

## Database Schema

### Review Model:
```python
class Review(models.Model):
    user = ForeignKey(User)
    workshop = ForeignKey(Workshop)
    service_request = OneToOneField(ServiceRequest, optional)
    rating = IntegerField(1-5)
    comment = TextField(optional)
    created_at = DateTimeField(auto)
    updated_at = DateTimeField(auto)
```

### Workshop Model (Rating Fields):
```python
class Workshop(models.Model):
    ...
    rating = DecimalField(0.0-5.0, default=0.0)
    reviews_count = IntegerField(default=0)
    ...
```

## API Endpoints

### Create Review:
```
POST /api/reviews/
Authorization: Bearer <firebase_token>

Body:
{
  "workshop_id": 1,
  "rating": 5,
  "comment": "Excellent service!",
  "service_request": 123  // optional
}
```

### Get Workshop Reviews:
```
GET /api/reviews/workshop_reviews/?workshop_id=1
```

## Future Enhancements

Potential improvements for the rating system:

1. **Review Display**: Show all reviews on mechanic profile pages
2. **Review Responses**: Allow mechanics to respond to reviews
3. **Review Moderation**: Admin panel to moderate inappropriate reviews
4. **Rating Filters**: Filter mechanics by minimum rating
5. **Review Photos**: Allow customers to upload photos with reviews
6. **Verified Reviews**: Mark reviews from confirmed service completions
7. **Rating Breakdown**: Show distribution of 1-5 star ratings
8. **Helpful Votes**: Allow users to mark reviews as helpful

## Troubleshooting

### Rating Not Submitting:
- Ensure you're logged in
- Check that you selected a star rating (1-5)
- Verify internet connection
- Check browser console for errors

### Rating Button Not Showing:
- Ensure the service request status is "completed"
- Refresh the dashboard page
- Check that you're viewing your own requests (not mechanic dashboard)

### Rating Not Updating:
- The workshop rating updates automatically via backend
- Refresh the page to see updated ratings
- Check that the review was successfully created in the database

## Support

For issues or questions about the rating system:
- Check the browser console for error messages
- Verify the Django backend is running
- Ensure Firebase authentication is working
- Contact support if problems persist
