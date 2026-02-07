"""
Vercel-compatible API entry point for the Todo application
This file serves as the entry point for Vercel deployments
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

# Import models to register them with SQLModel
from src.models.user import User
from src.models.todo import Todo

# Import database connection
from src.database.connection import engine

# Initialize FastAPI app
app = FastAPI(
    title="Todo Web Application API",
    description="API for the Full-Stack Secure Todo Web Application",
    version="1.0.0"
)

# Configure CORS for production
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,https://hackathon-2-phase-3-navy.vercel.app")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

# Add your frontend domain to allowed origins
frontend_domain = "https://hackathon-2-phase-2-pink.vercel.app"
if frontend_domain not in allowed_origins:
    allowed_origins.append(frontend_domain)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routers
from src.api.auth_routes import router as auth_router
from src.api.todo_routes import router as todo_router
from src.api.chat_routes import router as chat_router

# Include API routers
app.include_router(auth_router, prefix="/auth")
app.include_router(todo_router, prefix="/todos")
app.include_router(chat_router, prefix="/chat")

# Create tables on startup (for serverless compatibility)
try:
    print("Attempting to create database tables...")
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")

@app.get("/")
def read_root():
    return {"message": "Todo Web Application API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# For Vercel deployment, make sure the app object is available at the module level
# This is accessed as 'app' in the vercel.json configuration