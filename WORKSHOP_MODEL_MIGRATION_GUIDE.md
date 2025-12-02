# Workshop Model Update - Migration Guide

## Overview
The Workshop model has been enhanced to better align with the frontend Firestore structure and support the new workshop management features.

## Key Changes to Workshop Model

### 1. **Multiple Services Support**
- **Old**: Single `service_type` field (char field with choices)
- **New**: `services` field (JSONField storing array)
- **Example**: `['car', 'bike', 'emergency', 'towing']`

### 2. **Separated Name Fields**
- **New**: `mechanic_name` - Name of the mechanic
- **New**: `workshop_name` - Name of the workshop
- **Old**: Single `name` field (removed)

### 3. **Workshop Status**
- **New**: `is_open` (Boolean) - Whether workshop is currently accepting requests
- **Existing**: `availability` - Detailed availability status ('available', 'busy', 'offline')

### 4. **Photo Handling**
- **New**: `photo` (URLField) - For external photo URLs (compatible with Firestore)
- **Existing**: `image` (ImageField) - For uploaded files

### 5. **Reviews Count**
- **New**: `reviews_count` - Renamed from `total_reviews` for consistency with frontend

### 6.  **Optional Location Fields**
- `address`, `city`, `state`, `pincode` now optional (blank=True)
- Makes it easier for mechanics to start with just coordinates

### 7. **Database Indexes**
- Added indexes for common queries:
  - Location queries: `['latitude', 'longitude']`
  - Status filtering: `['is_open', 'availability']`  
  - Rating sorting: `['-rating']`

### 8. **Helper Method**
- `update_rating()` - Automatically calculates average rating from reviews

## Migration Steps

### Step 1: Create Migration
```bash
cd backend
python manage.py makemigrations
```

### Step 2: Review Migration File
The migration will handle:
- Renaming `name` to `workshop_name`
- Adding `mechanic_name` field
- Converting `service_type` to `services` JSONField
- Adding `is_open` boolean field
- Adding `photo` URL field
- Renaming `total_reviews` to `reviews_count`
- Creating database indexes

### Step 3: Data Migration (if you have existing data)
You may need to create a custom data migration to:
1. Convert single `service_type` to `services` array
2. Split `name` into `mechanic_name` and `workshop_name`
3. Set default `is_open = True` for existing workshops

Example custom migration:
```python
from django.db import migrations\

def convert_service_types(apps, schema_editor):
    Workshop = apps.get_model('api', 'Workshop')
    for workshop in Workshop.objects.all():
        # Convert single service_type to array
        if hasattr(workshop, 'service_type'):
            workshop.services = [workshop.service_type]
        
        # Set mechanic_name from name if not set
        if not workshop.mechanic_name:
            workshop.mechanic_name = "Mechanic"  # or extract from name
        
        # Ensure is_open is set
        if workshop.is_open is None:
            workshop.is_open = True
        
        workshop.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0001_initial'),  # Update with your last migration
    ]

    operations = [
        migrations.RunPython(convert_service_types),
    ]
```

### Step 4: Apply Migration
```bash
python manage.py migrate
```

### Step 5: Update Admin Interface (if using Django Admin)
Update `admin.py` to reflect new fields:
```python
from django.contrib import admin
from .models import Workshop

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ['workshop_name', 'mechanic_name', 'city', 'is_open', 'rating', 'reviews_count']
    list_filter = ['is_open', 'availability', 'is_verified', 'services']
    search_fields = ['workshop_name', 'mechanic_name', 'phone', 'city']
    readonly_fields = ['rating', 'reviews_count', 'created_at', 'updated_at']
```

## API Updates Needed

If you have existing API endpoints, update them to:

### 1. **Workshop Creation/Update**
```python
# Example serializer update
class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = [
            'id', 'mechanic_name', 'workshop_name', 'phone', 'email',
            'latitude', 'longitude', 'services', 'photo', 'is_open',
            'availability', 'rating', 'reviews_count', 'is_verified'
        ]
        read_only_fields = ['rating', 'reviews_count', 'is_verified']
```

### 2. **Service Request Updates**
ServiceRequest.service_type now has expanded choices:
- 'car'
- 'bike'
- 'truck'
- 'emergency'
- 'towing'
- 'inspection'

## Frontend-Backend Alignment

The Workshop model now perfectly matches the Firestore `Mechanic` interface:

### Firestore (Frontend)
```typescript
interface Mechanic {
  id: string;
  userId: string;
  name: string;              // -> mechanic_name
  phone: string;
  workshop_name: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  is_open: boolean;
  photo: string;
  reviews_count: number;
}
```

### Django (Backend)
```python
class Workshop:
    owner (User FK)            # -> userId
    mechanic_name              # -> name
    phone
    workshop_name
    latitude
    longitude
    services (JSONField)
    rating
    is_open
    photo (URLField)
    reviews_count
```

## Testing Checklist

- [ ] Migration runs without errors
- [ ] Existing workshop data preserved
- [ ] Can create new workshops with multiple services
- [ ] `is_open` field works correctly
- [ ] Photo URLs save properly
- [ ] Rating aggregation works
- [ ] Indexes improve query performance
- [ ] API endpoints return correct data format
- [ ] Frontend can create/update workshops successfully

## Rollback Plan

If issues arise:
```bash
# Rollback to previous migration
python manage.py migrate api 0001_initial  # Replace with your previous migration number

# Or restore from database backup
```

## Notes

- The `services` JSONField requires PostgreSQL 9.4+, MySQL 5.7.8+, or SQLite 3.9.0+
- Consider adding validation for services array values
- The `update_rating()` method should be called after Review save/delete signals
- Consider adding a signal to auto-update workshop rating when reviews change
