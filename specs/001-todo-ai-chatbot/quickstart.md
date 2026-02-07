# Quickstart Guide: Todo AI Chatbot

## Overview
This guide provides a quick way to get the Todo AI Chatbot feature up and running. The chatbot allows users to manage todos through natural language commands using a persistent interface in the dashboard navbar.

## Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Access to Neon DB PostgreSQL database
- Git for version control

## Environment Setup

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables by copying `.env.example` to `.env` and filling in your Neon DB credentials:
```bash
# Copy the example file
cp .env.example .env
# Edit .env to include your Neon DB connection string
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

3. Set up environment variables by creating `.env.local`:
```bash
# Create .env.local file
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Running the Application

### Start the Backend
1. Ensure you're in the backend directory with the virtual environment activated
2. Start the FastAPI server:
```bash
python -m uvicorn src.main:app --reload --port 8000
```

### Start the Frontend
1. Ensure you're in the frontend directory
2. Start the Next.js development server:
```bash
npm run dev
```

3. Visit `http://localhost:3000` to access the dashboard

## Using the Chatbot

Once the application is running:

1. Navigate to the dashboard in your browser
2. Locate the persistent chatbot interface in the navbar
3. Try natural language commands like:
   - "Add a new todo called 'Buy groceries'"
   - "Show my todos"
   - "Complete the meeting todo"
   - "Delete the old task"
   - "Update 'old task' to 'new task'"

## Architecture Overview

### Key Components
- **Chat Interface**: React component in the navbar that accepts natural language input
- **Intent Resolution**: Rule-based system that maps user input to specific todo operations
- **MCP Tools**: Backend tools that perform actual todo operations on the database
- **Real-time Updates**: System that synchronizes dashboard UI with chatbot actions

### Data Flow
1. User types a command in the chat interface
2. Command is sent to the backend via API
3. Intent resolution service parses the command and identifies the operation
4. Corresponding MCP tool is called to perform the database operation
5. Operation result is sent back to the client
6. WebSocket connection notifies the dashboard to update the UI
7. User sees the updated todo list reflecting their chat command

## Troubleshooting

### Common Issues
- **Chatbot not responding**: Ensure backend server is running and MCP tools are accessible
- **UI not updating**: Check WebSocket connection and verify authentication tokens are passed correctly
- **Commands not recognized**: Verify the command follows expected patterns (see documentation for full command syntax)

### Development Tips
- Check backend logs for intent resolution errors
- Use browser developer tools to inspect API calls and WebSocket connections
- Verify database operations are correctly logged for each chat interaction

## Next Steps
1. Explore the full API documentation at `/docs`
2. Review the detailed command patterns in the main documentation
3. Customize the chatbot interface styles in the `PersistentChatNavbar` component
4. Extend the intent resolution patterns for additional command types