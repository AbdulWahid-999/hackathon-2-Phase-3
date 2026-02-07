import sys
sys.path.append('.')

from src.database.connection import engine
from src.models.user import User
from src.models.todo import Todo
from sqlmodel import SQLModel

try:
    print('Attempting to create tables...')
    SQLModel.metadata.create_all(bind=engine)
    print('Tables created successfully!')

    # Verify tables exist
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f'Existing tables: {tables}')

except Exception as e:
    print(f'Error creating tables: {e}')
    import traceback
    traceback.print_exc()