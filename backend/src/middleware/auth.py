from fastapi import HTTPException, status, Request
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlmodel import Session, select
from ..models.user import User
from ..exceptions import UnauthorizedException
import os
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Note: Do not use load_dotenv() in Vercel serverless functions
# Environment variables are set directly in the Vercel dashboard

# Get secret key from environment
SECRET_KEY = os.getenv("SECRET_KEY", "your-default-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthMiddleware:
    """
    Authentication middleware to protect routes.
    Validates JWT tokens and extracts user information.
    """

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """
        Create a new JWT access token with expiration.
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """
        Verify the JWT token and return user info.
        """
        if not token or not token.startswith("Bearer "):
            return None

        # Extract the actual token part
        actual_token = token[7:]

        try:
            # Decode the JWT token
            payload = jwt.decode(actual_token, SECRET_KEY, algorithms=[ALGORITHM])

            # Extract user_id and email from token
            user_id: str = payload.get("sub")
            email: str = payload.get("email")

            if user_id is None or email is None:
                return None

            return {"user_id": user_id, "email": email}

        except JWTError:
            # Token is invalid
            return None

    @staticmethod
    def get_current_user(request: Request, session: Session) -> Optional[User]:
        """
        Extract the current user from the request based on the auth token.
        """
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            raise UnauthorizedException("Authorization header is required")

        user_data = AuthMiddleware.verify_token(auth_header)

        if not user_data:
            raise UnauthorizedException("Invalid or expired token")

        # Extract user_id and validate it's a proper string
        user_id_str = user_data.get("user_id")
        if not user_id_str:
            raise UnauthorizedException("Invalid token: missing user_id")

        # Convert to UUID for comparison
        try:
            user_id_uuid = uuid.UUID(str(user_id_str))
        except ValueError:
            raise UnauthorizedException("Invalid token: malformed user_id")

        # Fetch the actual user from the database - use execute() for standard SQLAlchemy session
        statement = select(User).where(User.id == user_id_uuid)
        result = session.execute(statement)
        user_row = result.first()

        # Extract the User object from the result row
        user_db = user_row[0] if user_row else None

        if not user_db or not user_db.is_active:
            raise UnauthorizedException("User not found or inactive")

        return user_db

from fastapi import Depends
from ..database.connection import get_session

def require_auth(request: Request, session: Session = Depends(get_session)) -> User:
    """
    Dependency to require authentication for protected routes.
    """
    try:
        return AuthMiddleware.get_current_user(request, session)
    except UnauthorizedException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )