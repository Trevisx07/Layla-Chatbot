# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import google.generativeai as genai
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Initialize FastAPI app
# app = FastAPI(title="HR Policy Bot")

# # Configure Gemini - UPDATED MODEL NAME
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel('gemini-1.5-flash')

# # CORS configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SYSTEM_PROMPT = """

# You are an expert HR assistant chatbot named PolicyBot. 
# Based on the above policy, Answer employee questions strictly using the company's official HR and policy documents.
# Be concise, professional and helpful.i want 100 percent accurate and in easy and human language and in paragraph form only.

# Guidelines:
# 1. For leave policies, mention types (sick, casual, earned), approval process, and notice period
# 2. For remote work, mention eligibility, approval process, and equipment policies
# 3. For reimbursements, mention eligible expenses, limits, and submission process
# 4. For holidays, refer to the official holiday calendar
# 5. If unsure, say "Let me connect you with HR for further assistance."

# Always respond in a friendly but professional tone.


# """


# @app.get("/")
# async def health_check():
#     return {"status": "PolicyBot backend is running"}

# @app.post("/chat")
# async def chat_endpoint(request: Request):
#     try:
#         data = await request.json()
#         user_message = data.get("message", "")
        
#         if not user_message:
#             return {"response": "Please provide your question."}
        
#         # Generate response
#         full_prompt = f"{SYSTEM_PROMPT}\n\nEmployee Question: {user_message}\n\nHR Policy Answer:"
        
#         response = model.generate_content(
#             full_prompt,
#             generation_config={
#                 "max_output_tokens": 512,
#                 "temperature": 0.3
#             }
#         )
        
#         answer = response.text.strip()
#         return {"response": answer}
        
#     except Exception as e:
#         return {"response": f"Error processing your request: {str(e)}"}

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import google.generativeai as genai
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import auth, credentials
from jose import jwt

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="HR Policy Bot")

# Initialize Firebase Admin
cred = credentials.Certificate("serviceAccountKey.json")  # Download from Firebase Console
firebase_admin.initialize_app(cred)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Security
security = HTTPBearer()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """..."""  # Your existing prompt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get('email')
        
        if not email.endswith('@raapidinc.com'):
            raise HTTPException(status_code=403, detail="Access restricted to raapidinc.com emails only")
            
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "PolicyBot backend is running"}

@app.post("/chat")
async def chat_endpoint(request: Request, user: dict = Depends(get_current_user)):
    try:
        data = await request.json()
        user_message = data.get("message", "")

        if not user_message:
            return {"response": "Please provide your question."}

        # Generate response
        full_prompt = f"{SYSTEM_PROMPT}\n\nEmployee Question: {user_message}\n\nHR Policy Answer:"

        response = model.generate_content(
            full_prompt,
            generation_config={
                "max_output_tokens": 512,
                "temperature": 0.3
            }
        )

        answer = response.text.strip()
        return {"response": answer}

    except Exception as e:
        return {"response": f"Error processing your request: {str(e)}"}