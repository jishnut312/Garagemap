# Firebase Service Account Credentials

To enable Django + Firebase integration, you need to add your Firebase service account credentials here.

## How to get credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **garagemap-11a27**
3. Click the gear icon (⚙️) → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file as `firebase-credentials.json` in this `backend/` directory

## Alternative (for development):

If you don't want to download the file, you can set environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-credentials.json"
```

## Security Note:
**Never commit firebase-credentials.json to git!**
It's already added to .gitignore.
