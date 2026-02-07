from src.database.connection import engine
from src.models.user import User
from src.models.todo import Todo
from sqlmodel import SQLModel

def create_tables():
    print("Creating database tables...")
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()