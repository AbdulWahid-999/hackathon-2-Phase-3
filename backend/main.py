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

# Configure CORS for production
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")] if allowed_origins_env else []

# Add your frontend domains to allowed origins
frontend_domains = [
    "https://hackathon-2-phase-3-navy.vercel.app",
    "https://your-frontend-domain.vercel.app"
]

for domain in frontend_domains:
    if domain not in allowed_origins:
        allowed_origins.append(domain)

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

# Include API routers
app.include_router(auth_router)
app.include_router(todo_router)

@app.get("/")
def read_root():
    return {"message": "Todo Web Application API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)