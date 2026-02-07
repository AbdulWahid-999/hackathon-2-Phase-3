from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Note: Do not use load_dotenv() in Vercel serverless functions
# Environment variables are set directly in the Vercel dashboard

app = FastAPI(
    title="Todo Web Application API",
    description="API for the Full-Stack Secure Todo Web Application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include API routers
from src.api.auth_routes import router as auth_router
from src.api.todo_routes import router as todo_router

# Include API routers
app.include_router(auth_router)
app.include_router(todo_router)

@app.get("/")
def read_root():
    return {"message": "Todo Web Application API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)