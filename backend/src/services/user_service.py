from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Dict
from ..models.user import User, UserCreate
from ..exceptions import InvalidCredentialsException, DuplicateEmailException

# Import passlib context with multiple schemes for flexibility
from passlib.context import CryptContext

# Configure CryptContext with multiple schemes and proper settings
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],  # Primary schemes in order of preference
    deprecated="auto",  # Mark older schemes as deprecated when used
    # Argon2 specific settings
    argon2__rounds=4,    # Lower rounds for development (increase for production)
    argon2__memory_cost=65536,  # 64 MiB
    argon2__parallelism=1,
    # Bcrypt specific settings
    bcrypt__rounds=12,   # Number of rounds for bcrypt
)

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def register_user(self, user_data: UserCreate) -> User:
        """
        Register a new user with hashed password.
        Implements registration logic with password hashing and validation.
        """
        # Check if user already exists - use execute() method for standard SQLAlchemy session
        statement = select(User).where(User.email == user_data.email)
        result = self.session.execute(statement)
        existing_user_row = result.first()
        existing_user = existing_user_row[0] if existing_user_row else None

        if existing_user:
            raise DuplicateEmailException()

        # Hash the password
        password_hash = pwd_context.hash(user_data.password)

        # Create new user
        db_user = User(
            email=user_data.email,
            password_hash=password_hash,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Add to database
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)

        return db_user

    def authenticate_user(self, email: str, password: str) -> Dict[str, str]:
        """
        Authenticate user credentials and return JWT token.
        Implements login logic with password verification.
        """
        # Find user by email - use execute() method for standard SQLAlchemy session
        statement = select(User).where(User.email == email)
        result = self.session.execute(statement)
        user_row = result.first()

        if not user_row:
            print(f"User not found for email: {email}")
            raise InvalidCredentialsException()

        # Extract the User object from the result row
        # The result.first() returns a Row object, and the User is the first element
        user = user_row[0] if user_row else None

        if not user:
            print(f"User not found for email: {email}")
            raise InvalidCredentialsException()

        print(f"Debug: user object = {user}")
        print(f"Debug: user type = {type(user)}")
        print(f"Debug: user attributes = {dir(user) if user else 'None'}")

        try:
            password_hash_value = getattr(user, 'password_hash', None)
            print(f"Debug: password_hash = {password_hash_value}")

            if password_hash_value is None:
                print("Debug: password_hash attribute is None or doesn't exist")
                raise InvalidCredentialsException()

            # Verify password
            if not pwd_context.verify(password, password_hash_value):
                print("Debug: Password verification failed")
                raise InvalidCredentialsException()
        except Exception as e:
            print(f"Password verification error: {e}")
            raise InvalidCredentialsException()

        # Create JWT token
        from ..middleware.auth import AuthMiddleware
        from datetime import timedelta

        # Create data to encode in the token
        data = {
            "sub": str(user.id),  # Subject (user ID)
            "email": user.email,
            "user_id": str(user.id)
        }

        # Set token expiration
        expires_delta = timedelta(minutes=30)
        access_token = AuthMiddleware.create_access_token(data=data, expires_delta=expires_delta)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plaintext password against its hash.
        """
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """
        Generate a hash for the given password.
        """
        return pwd_context.hash(password)