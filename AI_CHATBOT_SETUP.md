# AI Chatbot Setup Guide

## 🤖 GarageMap AI Assistant

This guide will help you set up the AI-powered chatbot for customer assistance using Google Gemini.

---

## ✅ What's Been Implemented

### Backend (Django)
- ✅ Added `google-generativeai` to requirements.txt
- ✅ Created `/api/chatbot/` endpoint in `api/views.py`
- ✅ Configured Gemini AI with custom GarageMap context
- ✅ Added conversation history support

### Frontend (Next.js)
- ✅ Created `AIChatWidget.tsx` component
- ✅ Integrated into customer dashboard
- ✅ Beautiful floating chat UI with animations
- ✅ Real-time messaging with loading states

---

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key (FREE)

1. Visit: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- Perfect for development and initial launch!

---

### Step 2: Configure Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create or update `.env` file:**
   ```bash
   # Add this line to your .env file
   GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Install new dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Restart Django server:**
   ```bash
   python manage.py runserver
   ```

---

### Step 3: Test the Chatbot

1. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to customer dashboard:**
   - Go to `http://localhost:3000/dashboard`
   - Login as a customer (not mechanic)

3. **Look for the floating chat button:**
   - Purple/blue gradient button in bottom-right corner
   - Has a sparkles icon ✨
   - Click to open chat

4. **Try these test messages:**
   - "My car makes a grinding noise when I brake"
   - "How do I book a mechanic?"
   - "What services do you offer?"
   - "My AC isn't working"

---

## 🎯 Features

### Smart Vehicle Diagnosis
The AI can help customers understand car problems:
- Identifies likely issues based on symptoms
- Suggests urgency levels (low/medium/high/emergency)
- Recommends appropriate services

### Platform Guidance
Helps users navigate GarageMap:
- How to find mechanics
- How to book services
- Understanding service types
- Emergency assistance

### Conversation Memory
- Remembers last 10 messages for context
- Provides coherent, contextual responses
- Natural conversation flow

---

## 🎨 UI Features

- **Floating Button**: Animated, eye-catching entry point
- **Modern Chat Interface**: Clean, professional design
- **Real-time Responses**: Loading indicators and smooth animations
- **Responsive**: Works on all screen sizes
- **Accessible**: Keyboard navigation and ARIA labels

---

## 🔧 Customization

### Modify AI Behavior

Edit the system context in `backend/api/views.py` (line ~168):

```python
system_context = """You are GarageMap AI Assistant...
```

You can:
- Change the tone (more formal/casual)
- Add specific service details
- Include pricing information
- Add local area knowledge

### Styling

Edit `frontend/src/components/AIChatWidget.tsx`:
- Change colors (currently purple/blue gradient)
- Adjust size and position
- Modify animations
- Update button icon

---

## 📊 Monitoring Usage

### Check API Usage
Visit: **https://makersuite.google.com/app/apikey**
- View request counts
- Monitor rate limits
- Track daily usage

### Upgrade When Needed
If you exceed free tier:
- **Pay-as-you-go**: $0.075 per 1,000 requests
- Still very affordable for most use cases

---

## 🐛 Troubleshooting

### "AI service is not configured"
- Check that `GEMINI_API_KEY` is in your `.env` file
- Restart Django server after adding the key

### "AI service error"
- Verify API key is valid
- Check internet connection
- Ensure you haven't exceeded rate limits (15 req/min)

### Chat button not appearing
- Make sure you're on `/dashboard` page
- Logged in as a customer (not mechanic)
- Check browser console for errors

### CORS errors
- Ensure Django backend is running on `http://localhost:8000`
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

---

## 🎉 Next Steps

### Potential Enhancements
1. **Add to more pages**: Homepage, map-workshop, etc.
2. **Mechanic-specific chatbot**: Different context for mechanics
3. **Image analysis**: Upload car damage photos for AI assessment
4. **Voice input**: Speech-to-text integration
5. **Multilingual support**: Translate conversations
6. **Analytics**: Track common questions and improve responses

---

## 📝 API Endpoint Details

**Endpoint**: `POST /api/chatbot/`

**Request Body**:
```json
{
  "message": "My car won't start",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "That could be a dead battery, faulty starter, or fuel system issue..."
}
```

---

## 🔐 Security Notes

- API key is stored server-side only (not exposed to frontend)
- Chatbot endpoint is public (no auth required for easy access)
- Consider adding rate limiting for production
- Monitor usage to prevent abuse

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review browser console for errors
3. Check Django server logs
4. Verify all dependencies are installed

---

**Enjoy your new AI-powered chatbot! 🚗✨**
