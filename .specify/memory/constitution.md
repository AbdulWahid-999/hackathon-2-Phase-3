<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Modified principles: Updated to include AI Chatbot principles
Added sections: MCP-first Architecture, Stateless Persistence, Database-Backed Conversations, Cost Efficiency, Robust Error Handling, Frontend Dashboard standards, MCP Tool Design, No Autonomous Agents constraint
Removed sections: None
Templates requiring updates: ✅ Updated all
Follow-up TODOs: None
-->
# Todo AI Chatbot Constitution (MCP-only, Agentless)

## Core Principles

### Tech Stack Adherence
All development MUST follow the specified technology stack: Frontend - Next.js 14+ with App Router and Tailwind CSS for beautiful, responsive, modern UI (clean, minimal, dark mode support, professional look with gradients, cards, smooth animations). Backend - FastAPI (Python) with SQLModel for models and migrations. Database - Neon DB (PostgreSQL, serverless) for persistent storage. Authentication - Better Auth library (secure JWT-based, email/password register/login). This ensures consistency and deployment compatibility on Vercel.

### Code Quality and Type Safety
All code MUST be type-safe using Pydantic/SQLModel, follow clean architecture principles, include proper error handling, loading states, and responsive design (mobile-first). This ensures maintainability, reduces runtime errors, and provides a smooth user experience across all devices.

### Full-Stack Integration
The application MUST be built as a unified codebase deployable on Vercel (Next.js for frontend + serverless API routes), extending the previous Phase 1 in-memory console Todo app logic to persistent DB with per-user todos. This ensures seamless deployment and maintains continuity with existing functionality.

### Security-First Approach
All endpoints handling todo data MUST require authentication and implement proper JWT validation. Protected routes, secure session management, and proper data isolation between users are mandatory. This protects user data and ensures privacy.

### UI/UX Excellence
The application MUST feature an attractive dashboard with todo list (cards/grid), add/edit modal, complete toggle, delete functionality, optional due dates, and beautiful empty state. The UI must be polished and professional for the hackathon demo.

### Minimalist Implementation
All features MUST follow "no over-engineering" principle - keep simple but polished for hackathon demo. Only implement essential functionality with high-quality execution rather than complex features. This ensures timely delivery and focus on quality.

### MCP-first Architecture
All task operations must go through MCP tools. Backend logic must remain deterministic with no AI agent reasoning layer. This ensures predictability, testability, and maintainability of the system.

### Stateless Persistence
The backend must be stateless with full persistence in the database. No in-memory or server-side state between requests. This enables horizontal scalability and ensures system resilience.

### Clear Separation of Concerns
Maintain clear separation between frontend UI, API logic, MCP tools, and database. This promotes modularity, testability, and makes the system easier to reason about and maintain.

### Cost Efficiency
Avoid unnecessary model or agent usage. Implement lean architecture that minimizes computational costs while delivering the required functionality effectively.

### Robust Error Handling
Backend must implement robust error handling for invalid input, authentication failure, task not found, and ownership mismatch scenarios. This ensures system reliability and good user experience.

### Database-Backed Conversations
Conversation history must be reconstructed from the database on every request. This ensures persistence and consistency across server restarts and scaling events.

## Tech Stack Requirements

### Frontend Standards
Next.js 14+ with App Router for modern routing and server-side rendering
Tailwind CSS for consistent, responsive styling with dark mode support
Modern UI patterns: cards, gradients, smooth animations, mobile-first responsive design
Proper loading states, error boundaries, and accessibility compliance
Persistent chatbot navbar for AI interaction

### Backend Standards
FastAPI for type-safe, high-performance API endpoints
SQLModel for database models and migrations with proper relationships
Neon DB (PostgreSQL) for persistent storage with connection pooling
Better Auth for secure JWT-based authentication with email/password
Stateless design with database-backed persistence for all operations

## Standards

### Frontend Dashboard
The frontend dashboard must include a persistent chatbot navbar. Any task action triggered via chat (add, update, complete, delete) must immediately reflect in the dashboard UI.

### MCP Tool Design
MCP tools must be stateless, single-responsibility, and database-backed. Each tool should have a clear, focused purpose and persist all relevant data to the database.

## Constraints

### No Autonomous Agents
No OpenAI Agents SDK or autonomous agents. The system must operate deterministically with explicit state management.

### No Manual Coding Outside CLI Workflow
All development must occur within the Claude Code CLI workflow. No manual coding outside this process to maintain consistency and traceability.

### Controlled Task Operations
Task creation and mutation allowed only via MCP tools. This ensures consistent state management and auditability.

### Frontend Technology Limit
Frontend limited to Next.js + Tailwind CSS to maintain consistency with the existing project stack.

## Deployment Requirements
Single repository containing both frontend and backend
Deployable on Vercel (Next.js frontend + serverless API functions)
Environment variables for configuration
Proper build and optimization settings

## Development Workflow

### Testing Standards
Basic manual test instructions documented in README
Type checking must pass before commits
Error handling validated for all user flows
Responsive behavior tested on multiple screen sizes
Chatbot interaction flows tested for proper todo synchronization

### Code Review Process
All PRs must verify compliance with this constitution
UI changes must meet design standards
Security requirements must be validated
Performance impact must be considered
AI chatbot functionality must integrate properly with existing todo system

## Quality Gates
All code must pass type checking
Authentication required on protected endpoints
Database operations must use proper SQLModel patterns
UI must be responsive and follow accessibility guidelines
Chatbot actions must synchronize immediately with dashboard UI

## Security Standards

### Authentication Requirements
Better Auth library must be used consistently
All todo endpoints require valid JWT tokens
User data must be properly isolated
Session management must follow security best practices

### Data Protection
User data must not be accessible to other users
Proper input validation on all endpoints
SQL injection prevention through ORM usage
Secure handling of authentication tokens
AI chatbot interactions must respect user data boundaries

## Success Criteria

- Users can fully manage todos through natural language chat
- Chatbot actions stay perfectly synchronized with dashboard UI
- Conversations resume correctly after server restarts
- Every user action receives a clear confirmation or error response
- System is predictable, testable, and horizontally scalable

## Governance
This constitution supersedes all other development practices for this project. All specifications, plans, tasks, and implementations must comply with these principles. Any deviation requires explicit approval from project leadership and must be documented with clear justification.

**Version**: 1.1.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-02-04