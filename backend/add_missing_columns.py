"""
Script to add missing columns to the todo table in the database
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create database engine
engine = create_engine(DATABASE_URL)

# SQL commands to add missing columns
sql_commands = [
    """
    ALTER TABLE todo
    ADD COLUMN created_via_chat BOOLEAN DEFAULT FALSE;
    """,
    """
    ALTER TABLE todo
    ADD COLUMN last_modified_by_chat BOOLEAN DEFAULT FALSE;
    """
]

def add_missing_columns():
    print("Connecting to database...")
    print(f"Using database URL: {DATABASE_URL}")

    try:
        with engine.connect() as conn:
            # Check if columns already exist
            if "postgresql" in DATABASE_URL or "neon.tech" in DATABASE_URL:
                # For PostgreSQL/NeonDB
                result = conn.execute(text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'todo'
                    AND column_name IN ('created_via_chat', 'last_modified_by_chat');
                """))

                existing_columns = [row[0] for row in result.fetchall()]
                print(f"Existing columns in todo table: {existing_columns}")

                # Add columns that don't exist
                if 'created_via_chat' not in existing_columns:
                    print("Adding created_via_chat column...")
                    conn.execute(text("ALTER TABLE todo ADD COLUMN created_via_chat BOOLEAN DEFAULT FALSE;"))

                if 'last_modified_by_chat' not in existing_columns:
                    print("Adding last_modified_by_chat column...")
                    conn.execute(text("ALTER TABLE todo ADD COLUMN last_modified_by_chat BOOLEAN DEFAULT FALSE;"))

            else:
                # For SQLite (fallback)
                result = conn.execute(text("PRAGMA table_info(todo);"))
                columns = [row[1] for row in result.fetchall()]  # Second column is the column name
                print(f"Existing columns in todo table: {columns}")

                if 'created_via_chat' not in columns:
                    print("Adding created_via_chat column...")
                    conn.execute(text("ALTER TABLE todo ADD COLUMN created_via_chat BOOLEAN DEFAULT 0;"))

                if 'last_modified_by_chat' not in columns:
                    print("Adding last_modified_by_chat column...")
                    conn.execute(text("ALTER TABLE todo ADD COLUMN last_modified_by_chat BOOLEAN DEFAULT 0;"))

            conn.commit()
            print("Successfully added missing columns to the todo table!")

    except Exception as e:
        print(f"Error adding columns: {e}")
        # Try to continue with the next command if one fails
        try:
            with engine.connect() as conn:
                for cmd in sql_commands:
                    try:
                        conn.execute(text(cmd))
                        conn.commit()
                        print(f"Successfully executed: {cmd.strip()}")
                    except Exception as cmd_error:
                        print(f"Command failed (might already exist): {cmd_error}")
        except Exception as final_error:
            print(f"Final error: {final_error}")

if __name__ == "__main__":
    add_missing_columns()