# Firebase Email Configuration for Password Reset

## ✅ What's Already Set Up

The forgot password page is complete and will work with Firebase's default email service! 

## 🔧 Firebase Console Configuration

### Step 1: Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/garagemap-11a27/authentication/providers)
2. Click on **"Email/Password"** provider
3. Make sure it's **enabled**
4. Click **Save**

### Step 2: Customize Password Reset Email Template
1. Go to **Authentication** → **Templates** tab
2. Click on **"Password reset"**
3. Customize the email template:
   - **Sender name**: GarageMap
   - **Subject**: Reset your GarageMap password
   - **Email body**: Customize the message (optional)
4. Click **Save**

### Step 3: Configure Email Settings (Optional - For Custom SMTP)

If you want to use your own email service with an app password:

1. Go to **Authentication** → **Settings** → **Email enumeration protection**
2. For custom SMTP, you'll need to use **Firebase Extensions**:
   - Install the "Trigger Email" extension
   - Configure with your SMTP details and app password

## 📧 Using App Password with Custom Email Service

If you want to send emails through your own email service (Gmail, Outlook, etc.):

### For Gmail:
1. Enable 2-Step Verification in your Google Account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use this in your email configuration

### Configuration file (if using custom backend):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=GarageMap <your-email@gmail.com>
```

## 🎯 Current Setup (Default Firebase)

The forgot password functionality is **already working** with Firebase's built-in email service:

✅ User enters email on `/forgot-password`
✅ Firebase sends password reset email automatically
✅ User clicks link in email
✅ Firebase handles password reset
✅ User can log in with new password

## 🧪 Testing

1. Navigate to: `http://localhost:3000/forgot-password`
2. Enter a registered email address
3. Click "Send Reset Link"
4. Check inbox for password reset email
5. Click the link and set a new password

## 🎨 Features Included

- ✅ Beautiful gradient UI matching your design system
- ✅ Loading states and animations
- ✅ Error handling for invalid emails
- ✅ Success confirmation message
- ✅ Responsive design
- ✅ Back to login link
- ✅ Accessibility features

## 🔗 Linked Pages

The forgot password page is already linked from:
- `/login` - "Forgot password?" link

No additional configuration needed unless you want custom SMTP!
