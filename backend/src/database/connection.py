from sqlmodel import create_engine
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Note: Do not use load_dotenv() in Vercel serverless functions
# Environment variables are set directly in the Vercel dashboard

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Debug: Print detailed information about the database URL (remove in production)
print(f"DEBUG: DATABASE_URL environment variable = '{DATABASE_URL}'")
print(f"DEBUG: DATABASE_URL type = '{type(DATABASE_URL)}'")
print(f"DEBUG: Is DATABASE_URL empty? {not DATABASE_URL or DATABASE_URL.strip() == ''}")

# For NeonDB PostgreSQL, we need to handle the connection differently
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    print("DEBUG: Connecting to PostgreSQL")
    # For PostgreSQL, create engine with appropriate settings for NeonDB
    # Use connection pooling and proper SSL settings for NeonDB serverless
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        connect_args={
            "sslmode": "require",
            "keepalives_idle": 300,
            "keepalives_interval": 30,
            "keepalives_count": 3
        }
    )
elif DATABASE_URL and DATABASE_URL.startswith("postgres://"):  # Alternative format
    print("DEBUG: Connecting to PostgreSQL (postgres:// format)")
    # For PostgreSQL, create engine with appropriate settings for NeonDB
    # Use connection pooling and proper SSL settings for NeonDB serverless
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        connect_args={
            "sslmode": "require",
            "keepalives_idle": 300,
            "keepalives_interval": 30,
            "keepalives_count": 3
        }
    )
elif DATABASE_URL and DATABASE_URL.startswith("sqlite://"):
    print("DEBUG: Connecting to SQLite - this should not happen in production!")
    # For SQLite, create engine with appropriate settings
    engine = create_engine(DATABASE_URL, echo=True)
else:
    print(f"DEBUG: Unknown DB type or not set, defaulting to SQLite. URL: '{DATABASE_URL}'")
    # Default to SQLite for local development
    engine = create_engine("sqlite:///./todo_app.db", echo=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    """Dependency to get database session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()