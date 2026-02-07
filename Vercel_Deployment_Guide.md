# Vercel Deployment Guide for Todo App with Neon DB

This guide explains how to deploy your Todo application to Vercel with Neon DB integration.

## Production-Ready Configuration

### 1. Environment Variables Setup

For Vercel deployment, set these environment variables in your Vercel dashboard:

```
DATABASE_URL: Your Neon DB connection string
SECRET_KEY: A strong random secret key
ENVIRONMENT: production
ALLOWED_ORIGINS: Comma-separated list of allowed origins (e.g., "https://your-frontend.vercel.app,http://localhost:3000")
```

### 2. Database Migration Strategy

Instead of creating tables at startup (which is not safe for production), use Alembic for database migrations:

1. Install alembic if not already installed:
```bash
pip install alembic
```

2. Initialize alembic in your backend directory:
```bash
cd backend
alembic init alembic
```

3. Configure `alembic.ini` to point to your models and database.

4. Create your first migration after connecting to Neon DB:
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 3. Vercel Configuration

The `vercel.json` file is configured to:
- Use the `@vercel/python` builder
- Route all requests to the FastAPI app
- Pass environment variables securely

### 4. API Flow for Production

1. **User Registration**: User sends POST to `/auth/register` with email and password
2. **User Login**: User sends POST to `/auth/login` with credentials, receives JWT
3. **Todo Operations**: All todo operations require JWT in Authorization header

### 5. Neon DB Connection Handling

The database connection is optimized for Neon DB with:
- Connection pooling settings
- SSL requirements
- Keep-alive settings for serverless environments

### 6. Deployment Steps

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy!

### 7. Frontend Integration

Your frontend should:
1. Call `/auth/register` to create accounts
2. Call `/auth/login` to get JWT tokens
3. Store JWT tokens securely (preferably in httpOnly cookies)
4. Include JWT in Authorization header for all todo operations
5. Handle 401/403 responses for authentication failures

### 8. Security Best Practices for Production

- Use strong SECRET_KEY (32+ random characters)
- Enable HTTPS for all traffic
- Implement rate limiting if needed
- Sanitize inputs appropriately
- Monitor database connection usage

### 9. Troubleshooting Production Issues

If you encounter issues in production:

1. Check that your Neon DB connection string is correct
2. Verify that database tables exist (use Alembic migrations)
3. Ensure CORS settings allow your frontend domain
4. Check that JWT tokens are being passed correctly in requests

### 10. Example Production API Calls

**Register User:**
```bash
curl -X POST "https://your-app.vercel.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePassword123"}'
```

**Login:**
```bash
curl -X POST "https://your-app.vercel.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePassword123"}'
```

**Create Todo (with JWT token):**
```bash
curl -X POST "https://your-app.vercel.app/todos/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Todo", "description": "Todo description", "is_completed": false}'
```

This setup ensures your application works seamlessly with Neon DB in production on Vercel!