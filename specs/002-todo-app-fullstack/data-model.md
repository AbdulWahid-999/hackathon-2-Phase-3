# Data Model: Full-Stack Secure Todo Web Application

## User Entity

**Fields:**
- `id`: UUID (Primary Key) - Unique identifier for the user
- `email`: String (Unique, Indexed) - User's email address for login
- `password_hash`: String - Hashed password using secure hashing algorithm
- `created_at`: DateTime - Timestamp when user account was created
- `updated_at`: DateTime - Timestamp when user account was last updated
- `is_active`: Boolean - Whether the account is active (default: True)

**Validation Rules:**
- Email must be valid format and unique across all users
- Password must meet security requirements (min length, complexity)
- Email cannot be changed after registration

**Relationships:**
- One-to-Many: User has many Todos (foreign key: todo.user_id)

## Todo Entity

**Fields:**
- `id`: UUID (Primary Key) - Unique identifier for the todo
- `title`: String (Required) - Title of the todo item
- `description`: Text (Optional) - Detailed description of the todo
- `is_completed`: Boolean - Completion status (default: False)
- `due_date`: DateTime (Optional) - Deadline for the todo
- `created_at`: DateTime - Timestamp when todo was created
- `updated_at`: DateTime - Timestamp when todo was last updated
- `user_id`: UUID (Foreign Key) - Reference to the owner user

**Validation Rules:**
- Title must not be empty
- Due date cannot be in the past (optional validation)
- User ID must reference an existing, active user
- Only the owner user can modify/delete the todo

**State Transitions:**
- `is_completed` can transition from False to True (mark as complete)
- `is_completed` can transition from True to False (mark as incomplete)

## Database Constraints

**Referential Integrity:**
- Foreign key constraint on `todo.user_id` references `user.id`
- Cascade delete disabled to prevent accidental todo deletion when user is deleted

**Indexes:**
- Index on `user.email` for fast authentication lookups
- Index on `todo.user_id` for efficient user todo retrieval
- Index on `todo.is_completed` for filtering completed todos
- Composite index on `(user_id, created_at)` for efficient timeline queries

## Security Considerations

**Data Isolation:**
- Each todo is associated with a specific user via foreign key
- API endpoints will validate that the requesting user owns the todo
- No cross-user access to todos is permitted

**Privacy:**
- User emails are stored encrypted or with limited access
- Password hashes are stored using bcrypt or similar secure algorithm
- No personally identifiable information beyond email is stored