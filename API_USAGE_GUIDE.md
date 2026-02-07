# Todo API Usage Guide

This guide explains how to properly use the Todo API to avoid the 422 Unprocessable Content error.

## Prerequisites

1. Make sure you have Python installed
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file in the backend directory with your Neon DB connection string

## Setting Up the Environment

1. Create your Neon DB account and project
2. Copy the connection string from your Neon dashboard
3. Update your `.env` file:

```env
DATABASE_URL='postgresql://your_username:your_password@ep-xxx-your-project-name.region.aws.neon.tech/neondb?sslmode=require'
SECRET_KEY='your-super-secret-key-change-this-in-production'
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BETTER_AUTH_SECRET='your-better-auth-secret-here'
```

## Step 1: Start the Server

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

## Step 2: Create Database Tables

Run this command once to create the necessary database tables:

```bash
cd backend
python create_tables.py
```

## Step 3: Register a User

First, register a new user account:

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

## Step 4: Login to Get JWT Token

Login to get your authentication token:

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Save the `access_token` from the response.

## Step 5: Create a Todo (This is where 422 errors occur)

Use the JWT token to create a todo:

```bash
curl -X POST "http://localhost:8000/todos/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Todo",
    "description": "Description of my todo",
    "is_completed": false
  }'
```

## Common Causes of 422 Errors:

1. **Missing Authorization Header**: Make sure to include `"Authorization: Bearer YOUR_JWT_TOKEN_HERE"`
2. **Invalid Token**: Token has expired or is malformed
3. **Wrong Field Names**: Make sure your JSON has correct field names (`title`, `description`, `is_completed`)
4. **Missing Required Fields**: `title` is required
5. **Wrong Data Types**: Ensure fields have correct types (string, boolean, etc.)

## Complete Example with Python:

```python
import requests

# Step 1: Register
register_response = requests.post("http://localhost:8000/auth/register", json={
    "email": "test@example.com",
    "password": "password123"
})

# Step 2: Login
login_response = requests.post("http://localhost:8000/auth/login", json={
    "email": "test@example.com",
    "password": "password123"
})

# Get the token
token = login_response.json()["access_token"]

# Step 3: Create a todo with proper authorization
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

todo_response = requests.post("http://localhost:8000/todos/",
                            headers=headers,
                            json={
                                "title": "Test Todo",
                                "description": "This is a test",
                                "is_completed": False
                            })

print(todo_response.json())
```

## Troubleshooting

If you still get 422 errors:

1. Check that your JWT token is valid and not expired
2. Verify that the Authorization header is formatted correctly
3. Make sure all required fields are present in your request body
4. Check that field names match exactly what the API expects
5. Ensure data types are correct (booleans should be true/false, not "true"/"false")

## Testing with the Python Script

You can also use the test script created at the root directory:

```bash
python test_todo_api.py
```

This script will walk through the entire process automatically.