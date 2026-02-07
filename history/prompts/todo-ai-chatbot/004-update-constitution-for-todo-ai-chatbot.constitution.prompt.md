---
id: 004
title: Update constitution for Todo AI Chatbot
stage: constitution
date: 2026-02-04
surface: agent
model: Claude Sonnet 4.5
feature: todo-ai-chatbot
branch: 001-todo-ai-chatbot
user: goku
command: /sp.constitution
labels: [constitution, ai-chatbot, todo-app]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```
/sp.constitution
 /sp.constitution

Project: Todo AI Chatbot (MCP-only, Agentless)

Core principles:
- MCP-first architecture: all task operations must go through MCP tools
- Deterministic backend logic (no AI agent reasoning layer)
- Stateless backend with full persistence in the database
- Clear separation between frontend UI, API logic, MCP tools, and database
- Cost efficiency by avoiding unnecessary model or agent usage

Key standards:
- Frontend dashboard must include a persistent chatbot navbar
- Any task action triggered via chat (add, update, complete, delete) must
  immediately reflect in the dashboard UI
- MCP tools must be stateless, single-responsibility, and database-backed
- Backend must implement robust error handling (invalid input, auth failure,
  task not found, ownership mismatch)
- Conversation history must be reconstructed from the database on every request

Constraints:
- No OpenAI Agents SDK or autonomous agents
- No in-memory or server-side state between requests
- No manual coding outside the Claude Code CLI workflow
-[Request interrupted by user]/sp.constitution
 Project: Todo AI Chatbot (MCP-only, Agentless)

Core principles:
- MCP-first architecture: all task operations must go through MCP tools
- Deterministic backend logic (no AI agent reasoning layer)
- Stateless backend with full persistence in the database
- Clear separation between frontend UI, API logic, MCP tools, and database
- Cost efficiency by avoiding unnecessary model or agent usage

Key standards:
- Frontend dashboard must include a persistent chatbot navbar
- Any task action triggered via chat (add, update, complete, delete) must
  immediately reflect in the dashboard UI
- MCP tools must be stateless, single-responsibility, and database-backed
- Backend must implement robust error handling (invalid input, auth failure,
  task not found, ownership mismatch)
- Conversation history must be reconstructed from the database on every request

Constraints:
- No OpenAI Agents SDK or autonomous agents
- No in-memory or server-side state between requests
- No manual coding outside the Claude Code CLI workflow
-
- Task creation and mutation allowed only via MCP tools
- Frontend limited to Next.js + Tailwind CSS

Success criteria:
- Users can fully manage todos through natural language chat
- Chatbot actions stay perfectly synchronized with dashboard UI
- Conversations resume correctly after server restarts
- Every user action receives a clear confirmation or error response
- System is predictable, testable, and horizontally scalable
```

## Response snapshot

```
I'll update the existing constitution file to incorporate the new Todo AI Chatbot principles:

[File content showing the updated constitution with AI Chatbot principles integrated]
```

## Outcome

- ✅ Impact: Updated constitution to include AI Chatbot project principles and constraints
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated successfully
- 🔁 Next prompts: Will proceed with implementing the Todo AI Chatbot based on updated constitution
- 🧠 Reflection: Constitution successfully updated to reflect new project direction with MCP-first architecture and stateless design principles

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin Todo AI Chatbot specification based on new constitution