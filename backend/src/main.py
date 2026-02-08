from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlmodel import SQLModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from .database.connection import engine

# Note: Do not use load_dotenv() in Vercel serverless functions
# Environment variables are set directly in the Vercel dashboard

# Import models to register them with SQLModel before creating tables
from .models.user import User
from .models.todo import Todo

app = FastAPI(
    title="Todo Web Application API",
    description="API for the Full-Stack Secure Todo Web Application",
    version="1.0.0"
)

# Create database tables at startup
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routers
from .api.auth_routes import router as auth_router
from .api.todo_routes import router as todo_router
from .api.chat_routes import router as chat_router

# Include API routers
app.include_router(auth_router)
app.include_router(todo_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "Todo Web Application API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)