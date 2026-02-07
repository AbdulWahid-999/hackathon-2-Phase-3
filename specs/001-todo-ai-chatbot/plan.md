# Implementation Plan: Todo AI Chatbot (MCP-only, Agentless)

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-02-04 | **Spec**: [link](spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a natural-language chatbot embedded in a dashboard UI that allows users to manage todos (add, list, update, complete, delete) using direct MCP tools, without any AI agent layer, while keeping the backend fully stateless. The system will feature deterministic intent resolution, persistent chat interface in the navbar, real-time dashboard synchronization, and robust error handling.

## Technical Context

**Language/Version**: Python 3.11 for backend (FastAPI), TypeScript/JavaScript for frontend (Next.js 14+)
**Primary Dependencies**: FastAPI, Next.js 14+, SQLModel, Tailwind CSS, Neon DB, python-dotenv
**Storage**: PostgreSQL via Neon DB (serverless)
**Testing**: pytest for backend, Jest/Cypress for frontend
**Target Platform**: Web application (deployable on Vercel)
**Project Type**: Full-stack web application with persistent dashboard UI
**Performance Goals**: UI updates within 2 seconds of chatbot operations, 85%+ success rate for valid commands
**Constraints**: <200ms p95 for intent resolution, stateless backend design, secure JWT-based authentication
**Scale/Scope**: Individual user todos with proper data isolation, dashboard with real-time updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ MCP-first Architecture: All task operations will go through MCP tools with deterministic backend logic
- ✅ Stateless Persistence: Backend will be stateless with full persistence in database
- ✅ Clear Separation of Concerns: Clear separation maintained between frontend UI, API logic, MCP tools, and database
- ✅ Cost Efficiency: Using lean architecture without unnecessary model or agent usage
- ✅ Robust Error Handling: Will implement error handling for invalid input, auth failure, etc.
- ✅ Database-Backed Conversations: Conversation history will be reconstructed from database on each request
- ✅ No Autonomous Agents: No OpenAI Agents SDK or autonomous agents will be used
- ✅ Controlled Task Operations: Task creation/modification will be done only via MCP tools
- ✅ Frontend Technology Limit: Frontend will use Next.js + Tailwind CSS as required
- ✅ Authentication Requirements: Will use JWT-based authentication with proper data isolation

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py
│   │   ├── todo.py
│   │   └── chat_interaction.py
│   ├── services/
│   │   ├── todo_service.py
│   │   ├── user_service.py
│   │   └── intent_resolution_service.py
│   ├── api/
│   │   ├── auth_routes.py
│   │   ├── todo_routes.py
│   │   └── chat_routes.py
│   ├── database/
│   │   └── connection.py
│   ├── middleware/
│   │   └── auth.py
│   └── mcp_servers/
│       └── todo_mcp_server.py
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── ChatBot/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── Todo/
│   │   │   ├── TodoCard.tsx
│   │   │   └── TodoList.tsx
│   │   ├── Navbar/
│   │   │   └── PersistentChatNavbar.tsx
│   │   ├── Button.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── index.tsx
│   │   └── dashboard.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── hooks/
│   │   └── useTodos.ts
│   └── styles/
│       └── globals.css
└── tests/
```

**Structure Decision**: Selected full-stack web application structure with separate backend (FastAPI) and frontend (Next.js) to maintain clear separation of concerns as required by constitution. Backend handles API logic and MCP tools, frontend manages UI with persistent chat interface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple project structure | Required for clear separation of concerns | Single project would mix frontend and backend concerns |
| Additional models | Need for chat interactions and intent tracking | Would compromise data integrity without proper modeling |