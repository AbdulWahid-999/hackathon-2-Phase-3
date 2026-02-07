from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict
from ..database.connection import get_session
from ..models.user import UserCreate, UserRead, User
from ..services.user_service import UserService
from ..exceptions import InvalidCredentialsException, DuplicateEmailException
from ..middleware.auth import require_auth

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Register a new user with email and password.
    Implements user registration endpoint as specified in API contract.
    """
    try:
        # Check password length before processing
        if len(user_data.password) > 72:
            raise HTTPException(status_code=400, detail="Password cannot be longer than 72 characters")

        user_service = UserService(session)
        return user_service.register_user(user_data)
    except DuplicateEmailException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed due to server error")

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Dict[str, str])
def login(login_request: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user and return JWT token.
    Implements user login endpoint as specified in API contract.
    """
    try:
        user_service = UserService(session)
        return user_service.authenticate_user(login_request.email, login_request.password)
    except InvalidCredentialsException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        # Log the error for debugging
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed due to server error")


@router.get("/welcome", response_model=Dict[str, str])
def welcome(current_user: User = Depends(require_auth)):
    """
    Return a welcome message with the user's email.
    Implements GET /auth/welcome endpoint for displaying user-specific welcome message.
    """
    return {
        "message": f"Welcome back, {current_user.email}!",
        "email": current_user.email,
        "user_id": str(current_user.id)
    }