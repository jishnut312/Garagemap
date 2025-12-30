# Environment Variables for GarageMap Frontend

## Django API Configuration

Add this to your `.env.local` file (create if it doesn't exist):

```bash
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api
```

For production, update to your Django backend URL:
```bash
NEXT_PUBLIC_DJANGO_API_URL=https://your-django-backend.com/api
```
