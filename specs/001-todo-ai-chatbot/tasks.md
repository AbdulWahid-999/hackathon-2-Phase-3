# Implementation Tasks: Todo AI Chatbot (MCP-only, Agentless)

**Feature**: Todo AI Chatbot (MCP-only, Agentless)
**Branch**: `001-todo-ai-chatbot`
**Generated**: 2026-02-04
**Based on**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [contracts/openapi.yaml](contracts/openapi.yaml)

## Implementation Strategy

Build the Todo AI Chatbot in prioritized increments:
- **MVP**: User Story 1 (core chatbot functionality) with minimal UI
- **Increment 2**: User Story 2 (persistent interface)
- **Increment 3**: User Story 3 (intent resolution)
- **Increment 4**: User Story 4 (real-time sync)
- **Increment 5**: User Story 5 (error handling)
- **Polish**: Cross-cutting concerns and refinement

Each increment is independently testable with clear acceptance criteria from the specification.

## Phase 1: Setup (Project Initialization)

**Goal**: Set up project structure and foundational components for all user stories.

- [x] T001 Create chat interaction model in backend/src/models/chat_interaction.py
- [x] T002 Create intent model in backend/src/models/intent.py
- [x] T003 Create todo operation model in backend/src/models/todo_operation.py
- [x] T004 Update existing todo model to support chat integration in backend/src/models/todo.py
- [x] T005 [P] Create intent resolution service in backend/src/services/intent_resolution_service.py
- [x] T006 [P] Create chat service in backend/src/services/chat_service.py
- [x] T007 [P] Create chat API routes in backend/src/api/chat_routes.py
- [x] T008 Create MCP server for chatbot operations in backend/src/mcp_servers/todo_mcp_server.py

## Phase 2: Foundational Components (Blocking Prerequisites)

**Goal**: Implement shared infrastructure needed by all user stories.

- [x] T009 Implement chat route handlers with authentication in backend/src/api/chat_routes.py
- [x] T010 [P] Create chat interface component in frontend/src/components/ChatBot/ChatInterface.tsx
- [x] T011 [P] Create chat message component in frontend/src/components/ChatBot/ChatMessage.tsx
- [x] T012 [P] Create chat input component in frontend/src/components/ChatBot/ChatInput.tsx
- [x] T013 Implement chat API service in frontend/src/services/api.ts
- [x] T014 Add chat route to API service in frontend/src/services/api.ts
- [x] T015 Create chat hook in frontend/src/hooks/useChat.ts
- [x] T016 Configure WebSocket connection for real-time updates in frontend/src/services/api.ts

## Phase 3: User Story 1 - Chatbot Todo Management (Priority: P1)

**Goal**: Enable users to interact with chatbot to manage todos using natural language commands.

**Independent Test**: Can be fully tested by sending various natural language commands to the chatbot and verifying that corresponding todo operations are performed correctly. Delivers immediate value of simplified todo management.

- [x] T017 [US1] Implement rule-based intent detection for ADD command in backend/src/services/intent_resolution_service.py
- [x] T018 [US1] Implement rule-based intent detection for LIST command in backend/src/services/intent_resolution_service.py
- [x] T019 [US1] Implement rule-based intent detection for COMPLETE command in backend/src/services/intent_resolution_service.py
- [x] T020 [US1] Implement rule-based intent detection for DELETE command in backend/src/services/intent_resolution_service.py
- [x] T021 [US1] [P] Create MCP tool for adding todos in backend/src/mcp_servers/todo_mcp_server.py
- [x] T022 [US1] [P] Create MCP tool for listing todos in backend/src/mcp_servers/todo_mcp_server.py
- [x] T023 [US1] [P] Create MCP tool for completing todos in backend/src/mcp_servers/todo_mcp_server.py
- [x] T024 [US1] [P] Create MCP tool for deleting todos in backend/src/mcp_servers/todo_mcp_server.py
- [x] T025 [US1] Connect chat route to intent resolution service in backend/src/api/chat_routes.py
- [x] T026 [US1] Connect chat route to appropriate MCP tools based on intent in backend/src/api/chat_routes.py
- [x] T027 [US1] Create basic chat interface in frontend/src/pages/dashboard.tsx
- [x] T028 [US1] Implement chat submission functionality in frontend/src/components/ChatBot/ChatInterface.tsx
- [x] T029 [US1] Display chatbot responses in frontend/src/components/ChatBot/ChatInterface.tsx
- [ ] T030 [US1] Test: Verify "Add a new todo called 'Buy milk'" creates the todo (acceptance scenario 1)

## Phase 4: User Story 2 - Persistent Chat Interface (Priority: P1)

**Goal**: Provide consistent chatbot interface positioned in a persistent navbar on the dashboard.

**Independent Test**: Can be fully tested by navigating between different dashboard views and verifying that the chatbot navbar remains present. Delivers consistent access to chat functionality.

- [x] T031 [US2] Create persistent chat navbar component in frontend/src/components/Navbar/PersistentChatNavbar.tsx
- [x] T032 [US2] Integrate persistent chat navbar with existing dashboard layout in frontend/src/pages/dashboard.tsx
- [ ] T033 [US2] Ensure chat interface maintains context during navigation in frontend/src/components/Navbar/PersistentChatNavbar.tsx
- [ ] T034 [US2] Style the persistent chat navbar with Tailwind CSS in frontend/src/components/Navbar/PersistentChatNavbar.tsx
- [ ] T035 [US2] Test: Verify chatbot interface is consistently visible in navbar on any dashboard view (acceptance scenario 1)

## Phase 5: User Story 3 - Intent Resolution and Action Mapping (Priority: P2)

**Goal**: Parse natural language input from users and map it to specific todo operations using deterministic backend logic.

**Independent Test**: Can be tested by sending various natural language commands and verifying they trigger the correct MCP tools. Delivers accurate interpretation of user intent.

- [x] T036 [US3] Enhance intent resolution with entity extraction in backend/src/services/intent_resolution_service.py
- [x] T037 [US3] Implement confidence scoring for intent detection in backend/src/services/intent_resolution_service.py
- [x] T038 [US3] Add UPDATE command recognition to intent resolution in backend/src/services/intent_resolution_service.py
- [x] T039 [US3] Create MCP tool for updating todos in backend/src/mcp_servers/todo_mcp_server.py
- [x] T040 [US3] Add error handling for unrecognized intents in backend/src/services/intent_resolution_service.py
- [x] T041 [US3] Implement fallback responses for low-confidence intents in backend/src/services/intent_resolution_service.py
- [ ] T042 [US3] Test: Verify "Add a new todo 'Clean the house'" correctly identifies intent and invokes MCP tool (acceptance scenario 1)

## Phase 6: User Story 4 - Real-time Dashboard Synchronization (Priority: P2)

**Goal**: Update dashboard UI immediately when user performs todo operations through chatbot without requiring page refresh.

**Independent Test**: Can be tested by performing todo operations via chat and observing the dashboard update in real-time. Delivers immediate visual feedback for chat operations.

- [x] T043 [US4] Implement WebSocket broadcasting for todo updates in backend/src/api/chat_routes.py
- [x] T044 [US4] Add WebSocket event handlers in frontend/src/hooks/useTodos.ts
- [x] T045 [US4] Connect WebSocket updates to dashboard UI in frontend/src/components/Todo/TodoList.tsx
- [ ] T046 [US4] Update todo list when receiving WebSocket notifications in frontend/src/components/Todo/TodoList.tsx
- [ ] T047 [US4] Optimize dashboard updates for performance in frontend/src/components/Todo/TodoList.tsx
- [ ] T048 [US4] Test: Verify completing a todo via chat updates the dashboard UI immediately (acceptance scenario 1)

## Phase 7: User Story 5 - Error Handling and User Guidance (Priority: P3)

**Goal**: Provide helpful error messages and guidance when users enter invalid commands or ambiguous requests.

**Independent Test**: Can be tested by entering various invalid commands and verifying appropriate error responses. Delivers better user experience with clear guidance.

- [ ] T049 [US5] Implement comprehensive error handling for invalid commands in backend/src/services/intent_resolution_service.py
- [ ] T050 [US5] Add user-friendly error messages for unrecognized commands in backend/src/api/chat_routes.py
- [ ] T051 [US5] Provide command examples in error responses in backend/src/api/chat_routes.py
- [ ] T052 [US5] Handle authentication errors in chat routes in backend/src/api/chat_routes.py
- [ ] T053 [US5] Handle todo not found errors in backend/src/api/chat_routes.py
- [x] T054 [US5] Implement input validation for extremely long or malformed inputs in backend/src/services/intent_resolution_service.py
- [ ] T055 [US5] Display error messages in chat interface in frontend/src/components/ChatBot/ChatInterface.tsx
- [x] T056 [US5] Style error messages for better visibility in frontend/src/components/ChatBot/ChatMessage.tsx
- [ ] T057 [US5] Test: Verify ambiguous command "Do something" provides helpful guidance (acceptance scenario 1)

## Phase 8: Polish & Cross-cutting Concerns

**Goal**: Address remaining quality improvements, security, and cross-cutting requirements.

- [x] T058 Add logging for chat interactions in backend/src/api/chat_routes.py
- [ ] T059 Implement proper data isolation between users in backend/src/services/chat_service.py
- [x] T060 Add rate limiting to chat endpoints in backend/src/api/chat_routes.py
- [ ] T061 Create chat history retrieval endpoint in backend/src/api/chat_routes.py
- [ ] T062 Implement chat history display in frontend/src/components/ChatBot/ChatInterface.tsx
- [ ] T063 Add loading states to chat interface in frontend/src/components/ChatBot/ChatInterface.tsx
- [x] T064 Improve chat interface accessibility in frontend/src/components/ChatBot/ChatInterface.tsx
- [x] T065 Write integration tests for chat functionality in backend/tests/integration/test_chat.py
- [x] T066 Update README with chatbot usage instructions in README.md
- [ ] T067 Conduct end-to-end testing for all user stories

## Dependencies

**User Story 2 depends on**: User Story 1 (needs basic chat functionality first)
**User Story 4 depends on**: User Story 1 (needs basic todo operations first)
**User Story 5 depends on**: User Story 1 (needs basic chat handling first)

Most other stories can proceed in parallel after Phase 2 foundational components are complete.

## Parallel Execution Opportunities

**Within User Story 1**:
- T017-T020 (Intent detection implementations) can run in parallel
- T021-T024 (MCP tools) can run in parallel
- T027-T029 (Frontend components) can run in parallel

**Within User Story 4**:
- T043 (Backend WebSocket) and T044-T046 (Frontend WebSocket) can run in parallel

**Across User Stories**:
- Frontend styling and UI enhancements can run in parallel with backend logic
- Multiple MCP tools can be developed in parallel