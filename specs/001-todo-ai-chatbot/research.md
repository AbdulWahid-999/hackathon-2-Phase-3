# Research: Todo AI Chatbot (MCP-only, Agentless)

## Intent Resolution Patterns

### Decision: Use rule-based intent matching with keyword extraction
**Rationale**: Given the requirement for deterministic backend logic without complex AI reasoning, rule-based matching is most appropriate. It provides predictable behavior and can be easily tested and maintained.

**Alternatives considered**:
- Machine Learning models: Would violate the "no AI agent reasoning layer" constraint
- Third-party NLP services: Would add complexity and dependency, violating "cost efficiency"
- Regular expressions only: Might be too rigid and hard to maintain

### Implementation approach:
- Keyword-based detection for common verbs: "add", "create", "complete", "finish", "delete", "remove", "show", "list", "update"
- Pattern matching for common phrases: "Add a todo", "Complete [item]", "Show my todos"
- Entity extraction for todo content using simple parsing
- Fallback to error handling for unrecognized commands

## MCP Tool Design for Todo Operations

### Decision: Create specific MCP tools for each todo operation
**Rationale**: Aligns with the constitution's requirement that "MCP tools must be stateless, single-responsibility, and database-backed".

**Alternatives considered**:
- Single generic MCP tool: Would violate single-responsibility principle
- Direct database access from API: Would bypass MCP tools, violating the constitution
- Multiple operations in single tool: Would violate statelessness requirement

### Specific MCP tools:
- `create_todo_tool`: Creates new todos with title and description
- `read_todos_tool`: Lists todos for the current user
- `update_todo_tool`: Updates todo status (complete/incomplete) or content
- `delete_todo_tool`: Removes todos from the database

## Real-time UI Synchronization

### Decision: Use server-sent events (SSE) or WebSocket connection for real-time updates
**Rationale**: Need to achieve "Dashboard UI reflects task changes within 2 seconds of chatbot operations" as specified in success criteria. SSE provides a lightweight solution for pushing updates from server to client.

**Alternatives considered**:
- Polling: Would be inefficient and might not meet 2-second requirement
- Client-side refetch: Would not provide true real-time updates
- Long polling: More complex than SSE with marginal benefits

### Implementation approach:
- WebSocket connection between chat interface and dashboard
- When MCP tool modifies data, emit event to notify connected clients
- Client-side listener updates the UI accordingly

## Persistent Chat Interface Architecture

### Decision: Embed chatbot in persistent navbar using React component
**Rationale**: Meets the requirement for "persistent chat interface in the dashboard navbar" while maintaining consistency with existing UI architecture.

**Alternatives considered**:
- Separate chat window: Would not be persistent across views
- Floating action button: Would not meet navbar requirement
- Dedicated chat page: Would not be persistent across dashboard views

### Implementation approach:
- Create `PersistentChatNavbar` component
- Integrate with existing authentication context
- Maintain chat history in component state but persist to database

## Authentication Integration

### Decision: Leverage existing JWT-based authentication with request interceptors
**Rationale**: The existing system already uses JWT-based authentication (Better Auth), so integrating with that system maintains consistency with the codebase.

**Alternatives considered**:
- Separate authentication for chat: Would create security inconsistencies
- Session-based auth: Would conflict with existing JWT system
- Anonymous chat with later authentication: Would violate security requirements

### Implementation approach:
- Use existing JWT tokens for chat requests
- Add authentication middleware to chat API endpoints
- Pass user context to MCP tools for data isolation

## Error Handling Strategy

### Decision: Implement comprehensive error handling with user-friendly messages
**Rationale**: Critical to meet the success criterion "95% of invalid or ambiguous commands receive appropriate error handling with clear user guidance".

**Alternatives considered**:
- Silent failure: Would provide poor user experience
- Generic error messages: Would not guide users effectively
- Raw exception output: Would expose system internals

### Implementation approach:
- Categorize errors: command syntax, authentication, data not found, etc.
- Provide specific, actionable feedback for each category
- Include examples of valid commands when appropriate