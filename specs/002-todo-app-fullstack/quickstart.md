# Quickstart Guide: Full-Stack Secure Todo Web Application

## Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.11+ (for FastAPI backend)
- PostgreSQL-compatible database (Neon DB recommended)
- Git
- Package managers: npm/pnpm/yarn for frontend, pip for backend

## Setup Instructions

### 1. Clone and Initialize Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secret keys
```

### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 4. Environment Configuration

Create `.env` files in both directories with the following variables:

**Backend (.env):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 5. Database Setup

```bash
# From backend directory
cd backend

# Apply database migrations
alembic upgrade head

# Or if using SQLModel directly
python -c "from src.database.connection import engine; from src.models import Base; Base.metadata.create_all(bind=engine)"
```

### 6. Running the Applications

#### Backend (FastAPI)

```bash
# From backend directory
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn src.main:app --reload --port 8000
```

#### Frontend (Next.js)

```bash
# From frontend directory
cd frontend
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Development Workflow

### Backend Development
- API endpoints are located in `src/api/`
- Models are defined in `src/models/`
- Services/logic in `src/services/`
- Run tests: `pytest`

### Frontend Development
- Pages in `src/app/` (using App Router)
- Components in `src/components/`
- API calls in `src/lib/api.ts`
- Styling with Tailwind CSS in `src/app/globals.css`

## API Endpoints

- **Base URL**: `http://localhost:8000/api/v1`
- **Auth**: `/auth/register`, `/auth/login`
- **Todos**: `/todos` (GET, POST), `/todos/{id}` (GET, PUT, DELETE)

## Authentication Flow

1. User registers via `/auth/register`
2. User logs in via `/auth/login` to get JWT token
3. JWT token is sent in Authorization header for protected endpoints
4. Token expires after 30 minutes (configurable)

## Testing

### Backend Tests
```bash
# Run all backend tests
cd backend
pytest

# Run with coverage
pytest --cov=src
```

### Frontend Tests
```bash
# Run all frontend tests
cd frontend
npm test
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command to handle both frontend and backend
4. Deploy!

### Environment Variables for Production

Same as development but with production values:
- Production database URL
- Strong secret keys
- Production API URLs