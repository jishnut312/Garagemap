
import google.generativeai as genai
from decouple import config
import os

# Try to load from .env file directly if decouple doesn't pick it up
try:
    with open('.env') as f:
        for line in f:
            if line.startswith('GEMINI_API_KEY='):
                os.environ['GEMINI_API_KEY'] = line.strip().split('=')[1]
                break
except:
    pass

api_key = os.environ.get('GEMINI_API_KEY') or config('GEMINI_API_KEY', default='')

if not api_key:
    print("Error: GEMINI_API_KEY not found.")
else:
    genai.configure(api_key=api_key)
    try:
        print("Listing available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")
