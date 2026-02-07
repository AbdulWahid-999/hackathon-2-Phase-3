from src.database.connection import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f'All tables: {tables}')

# Also check columns in the user table
if 'user' in tables:
    columns = inspector.get_columns('user')
    print(f'Columns in user table: {[col["name"] for col in columns]}')
elif 'users' in tables:
    columns = inspector.get_columns('users')
    print(f'Columns in users table: {[col["name"] for col in columns]}')
else:
    print('Looking for tables with user-like names...')
    for table in tables:
        if 'user' in table.lower():
            print(f'Found user-like table: {table}')
            columns = inspector.get_columns(table)
            print(f'Columns: {[col["name"] for col in columns]}')

# Check for todo tables too
for table in tables:
    if 'todo' in table.lower():
        print(f'Found todo-like table: {table}')
        columns = inspector.get_columns(table)
        print(f'Columns: {[col["name"] for col in columns]}')