# Workshop Management Feature for Mechanics

## Overview
Added comprehensive workshop management functionality allowing mechanics to add and edit their workshop information directly from the mechanic dashboard.

## Features Implemented

### 1. Firestore Functions (`firestore.ts`)
- **`createMechanicProfile()`**: Creates a new mechanic/workshop profile in Firestore
  - Parameters: userId, profileData (name, phone, workshop_name, location, services, etc.)
  - Returns: Document ID of the created profile

- **`updateMechanicProfile()`**: Updates an existing mechanic/workshop profile
  - Parameters: mechanicId, profileData (partial update)
  - Updates only the provided fields

### 2. Mechanic Dashboard Updates (`mechanic-dashboard/page.tsx`)

#### New UI Components:
- **"Add Workshop" Button**: Shown when a mechanic doesn't have a profile
  - Replaces the "profile not found" error with a clear call-to-action
  - Opens the workshop modal for profile creation

- **"Edit Workshop" Button**: Added to the dashboard header
  - Allows mechanics to update their existing workshop details
  - Icon + text button for easy access

- **Workshop Modal Form**: Comprehensive form with the following sections:
  - **Personal Information**: Name, Phone
  - **Workshop Information**: Workshop name, Location (latitude/longitude), Photo URL
  - **Services Offered**: Interactive toggle buttons for services (car, bike, truck, emergency, towing, inspection)
  - **Workshop Status**: Checkbox to mark workshop as open/closed

#### Form Features:
- Modern, clean design with rounded corners and gradients
- Validation for required fields
- Loading state while saving
- Success/error alerts
- Cancel option to close without saving
- Auto-populates with existing data when editing

### 3. User Experience Flow

#### For New Mechanics:
1. Log in to mechanic dashboard
2. See "Workshop Profile Not Found" message
3. Click "Add Workshop" button
4. Fill out the comprehensive workshop form
5. Submit to create profile
6. Dashboard reloads with workshop data

#### For Existing Mechanics:
1. Access dashboard with workshop info displayed in header
2. Click "Edit Workshop" button in header
3. Modal opens with pre-filled data
4. Make changes and submit
5. Profile updates and dashboard reflects changes

### 4. Technical Details

#### State Management:
- `showWorkshopModal`: Controls modal visibility
- `workshopForm`: Stores form data
- `isSavingWorkshop`: Shows loading state during save
- Auto-refreshes mechanic data after successful save

#### Data Validation:
- Required fields: Name, Phone, Workshop Name, Latitude, Longitude
- Optional fields: Photo URL
- Services: Multi-select with visual feedback
- Workshop status: Boolean checkbox

## Benefits

1. **Self-Service**: Mechanics can manage their own profiles without admin intervention
2. **Data Accuracy**: Direct updates ensure information stays current
3. **User-Friendly**: Intuitive form with clear sections and labels
4. **Professional UI**: Matches the app's design aesthetic with gradients, shadows, and smooth transitions
5. **Flexible**: Supports both creation and editing of profiles

## Usage Instructions

### Adding a Workshop:
1. Navigate to the mechanic dashboard
2. Click "Add Workshop" when prompted
3. Fill in all required fields
4. Select applicable services
5. Set workshop status
6. Click "Add Workshop" to save

### Editing a Workshop:
1. From the mechanic dashboard header
2. Click "Edit Workshop"
3. Update desired fields
4. Click "Update Workshop" to save changes

## Future Enhancements (Optional)
- Address autocomplete for location
- Map picker for latitude/longitude
- Image upload instead of URL
- Service pricing configuration
- Operating hours settings
- Multiple location support
