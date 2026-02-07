# Full-Stack Secure Todo Web Application

A full-stack todo application with user authentication and persistent storage, built with Next.js 14+, FastAPI, and SQLModel.

## Features

- User registration and authentication with JWT
- Secure todo management (CRUD operations)
- AI-powered chatbot for natural language todo management
- Responsive UI with Tailwind CSS
- Modern dashboard with card-based interface
- Dark mode support
- Data isolation between users
- Real-time synchronization between chat and dashboard
- Persistent chat interface in navbar
- Comprehensive error handling with user guidance

## Tech Stack

- **Frontend**: Next.js 14+ with App Router
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL (via Neon DB)
- **ORM**: SQLModel
- **Authentication**: Better Auth (JWT-based)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Installation

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL-compatible database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and secret keys
```

5. Run the development server:
```bash
cd src
python -m main
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URLs
```

4. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Todos
- `GET /todos` - Get user's todos
- `POST /todos` - Create a new todo
- `GET /todos/{id}` - Get a specific todo
- `PUT /todos/{id}` - Update a todo
- `DELETE /todos/{id}` - Delete a todo

### Chatbot
- `POST /chat/send` - Send a message to the AI chatbot
- `GET /chat/history` - Get chat history for the current user
- `POST /chat/intent-resolution` - Resolve intent from natural language without executing
- `WS /chat/ws/{user_id}` - WebSocket endpoint for real-time updates

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   ├── api/            # API routes
│   │   ├── database/       # Database connection
│   │   ├── middleware/     # Authentication middleware
│   │   └── main.py         # Main application entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   └── lib/           # Utilities and API clients
│   ├── package.json
│   └── tailwind.config.js
└── specs/                  # Specification documents
    └── 002-todo-app-fullstack/
```

## Development

The application follows a modular architecture that allows for independent development of features:

1. **Setup Phase**: Project initialization and basic structure
2. **Foundational Phase**: Core infrastructure (authentication, database)
3. **User Story 1**: Registration and authentication
4. **User Story 2**: Todo management
5. **User Story 3**: Dashboard experience
6. **Polish Phase**: Cross-cutting concerns and optimization

## Security

- JWT-based authentication with secure token handling
- Passwords hashed using bcrypt
- Input validation and sanitization
- SQL injection protection via ORM
- Proper session management

## Deployment

### Vercel Deployment with Neon DB

The application is configured for seamless deployment on Vercel with Neon DB integration.

#### Production Setup

1. **Environment Variables** (set in Vercel dashboard):
   - `DATABASE_URL`: Your Neon DB connection string
   - `SECRET_KEY`: Strong random secret key for JWT signing
   - `ENVIRONMENT`: Set to "production"
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains

2. **Database Migrations**:
   Instead of creating tables at startup, use Alembic for production:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

3. **Deploy to Vercel**:
   - Connect your Git repository to Vercel
   - Set the environment variables in the Vercel dashboard
   - The application will automatically deploy using the configuration in `vercel.json`

#### API Usage in Production

1. **Register User**: POST to `/auth/register` with email and password
2. **Login**: POST to `/auth/login` to receive JWT token
3. **Todo Operations**: Include JWT in Authorization header for all todo operations
4. **Chatbot Operations**: Use `/chat/send` endpoint to interact with the AI assistant

#### Chatbot Usage

The AI chatbot allows you to manage your todos using natural language commands:

- **Adding todos**: "Add buy groceries", "Create a new todo called 'Call mom'"
- **Listing todos**: "Show my todos", "What are my tasks?"
- **Completing todos**: "Complete the meeting todo", "Finish 'buy milk'"
- **Deleting todos**: "Delete old task", "Remove 'call mom'"
- **Updating todos**: "Update 'old task' to 'new task'"

The chat interface is available in the persistent navbar on the dashboard, allowing you to interact with your todos from anywhere in the application.

#### Security Features for Production

- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- User authorization (users can only access their own todos)
- SQL injection protection with SQLModel
- CORS configured for production environments

#### Troubleshooting

If you encounter issues:
- Verify your Neon DB connection string format
- Check that JWT tokens are properly included in requests
- Ensure CORS settings allow your frontend domain
- Monitor database connection limits

## License

MIT