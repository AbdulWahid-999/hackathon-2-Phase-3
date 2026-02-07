from sqlmodel import SQLModel, create_engine
from .connection import engine
from ..models.user import User
from ..models.todo import Todo

def create_db_and_tables():
    """
    Create database tables if they don't exist
    """
    SQLModel.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_db_and_tables()