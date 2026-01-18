from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import jwt
from passlib.context import CryptContext

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SignupRequest(BaseModel):
    email: str
    password: str
    username: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CreateNGLRequest(BaseModel):
    question: str
    is_anonymous: bool

class SubmitResponseRequest(BaseModel):
    message: str
    responder_name: str | None = None

# Auth Helpers
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str, email: str):
    payload = {"user_id": user_id, "email": email}
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        return None

def get_token_from_header(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return parts[1]

# Auth Routes
@app.post("/auth/signup")
def signup(req: SignupRequest):
    try:
        # Check if user exists
        existing = supabase.table("users").select("*").eq("email", req.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_pw = hash_password(req.password)
        
        supabase.table("users").insert({
            "id": user_id,
            "email": req.email,
            "username": req.username,
            "password": hashed_pw,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        token = create_token(user_id, req.email)
        return {"token": token, "user_id": user_id, "email": req.email, "username": req.username}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
def login(req: LoginRequest):
    try:
        user = supabase.table("users").select("*").eq("email", req.email).execute()
        
        if not user.data or not verify_password(req.password, user.data[0]["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_data = user.data[0]
        token = create_token(user_data["id"], user_data["email"])
        
        return {
            "token": token,
            "user_id": user_data["id"],
            "email": user_data["email"],
            "username": user_data["username"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/verify")
def verify(req: dict):
    token = req.get('token')
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# NGL Routes
@app.post("/ngl/create")
def create_ngl(req: CreateNGLRequest, authorization: str = Header(None)):
    token = get_token_from_header(authorization)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        ngl_id = str(uuid.uuid4())[:8]
        supabase.table("ngls").insert({
            "id": ngl_id,
            "creator_id": payload["user_id"],
            "question": req.question,
            "is_anonymous": req.is_anonymous,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return {"ngl_id": ngl_id, "question": req.question, "is_anonymous": req.is_anonymous}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/ngl/{ngl_id}")
def get_ngl(ngl_id: str):
    try:
        ngl = supabase.table("ngls").select("*").eq("id", ngl_id).execute()
        if not ngl.data:
            raise HTTPException(status_code=404, detail="NGL not found")
        
        return ngl.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ngl/{ngl_id}/respond")
def submit_response(ngl_id: str, req: SubmitResponseRequest):
    try:
        ngl = supabase.table("ngls").select("*").eq("id", ngl_id).execute()
        if not ngl.data:
            raise HTTPException(status_code=404, detail="NGL not found")
        
        ngl_data = ngl.data[0]
        responder_name = req.responder_name if not ngl_data["is_anonymous"] else None
        
        if not ngl_data["is_anonymous"] and not req.responder_name:
            raise HTTPException(status_code=400, detail="Name required for non-anonymous NGL")
        
        response_id = str(uuid.uuid4())
        supabase.table("responses").insert({
            "id": response_id,
            "ngl_id": ngl_id,
            "message": req.message,
            "responder_name": responder_name,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return {"response_id": response_id, "message": req.message, "responder_name": responder_name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/ngl/{ngl_id}/responses")
def get_responses(ngl_id: str):
    try:
        responses = supabase.table("responses").select("*").eq("ngl_id", ngl_id).order("created_at", desc=False).execute()
        return responses.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user/{user_id}/ngls")
def get_user_ngls(user_id: str, authorization: str = Header(None)):
    token = get_token_from_header(authorization)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload["user_id"] != user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        ngls = supabase.table("ngls").select("*").eq("creator_id", user_id).order("created_at", desc=True).execute()
        return ngls.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}