# Data Model: Todo AI Chatbot

## ChatInteraction Entity

**Purpose**: Represents a user's natural language input and the system's response

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for each chat interaction
- `user_id`: UUID (Foreign Key) - Links to the user who initiated the interaction
- `input_text`: String (255 chars max) - The raw natural language input from the user
- `intent_type`: Enum (ADD, LIST, UPDATE, DELETE, COMPLETE, UNKNOWN) - The classified intent from the input
- `entities_extracted`: JSON - Parsed entities like todo titles, descriptions, etc.
- `response_text`: String (1000 chars max) - The system's response to the user
- `status`: Enum (PROCESSED, FAILED, PENDING) - Status of the interaction processing
- `timestamp`: DateTime - When the interaction occurred
- `session_id`: UUID (Optional) - Groups related interactions together

**Validation Rules**:
- `input_text` must be between 1 and 255 characters
- `user_id` must reference an existing authenticated user
- `timestamp` is automatically set to current time when created

**Relationships**:
- Belongs to one `User` (via `user_id`)
- May trigger operations on multiple `Todo` entities (depending on intent)

## Intent Entity

**Purpose**: Represents the parsed action that corresponds to a specific todo operation

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for each intent
- `type`: Enum (ADD, LIST, UPDATE, DELETE, COMPLETE) - The type of action
- `parameters`: JSON - Parameters extracted for the action (todo title, content, etc.)
- `confidence_score`: Float (0.0-1.0) - Confidence in the intent classification
- `associated_chat_id`: UUID (Foreign Key) - Reference to the ChatInteraction that triggered this intent

**Validation Rules**:
- `confidence_score` must be between 0.0 and 1.0
- `type` must be one of the predefined enum values
- `associated_chat_id` must reference an existing ChatInteraction

**Relationships**:
- Linked to one `ChatInteraction` (via `associated_chat_id`)
- May affect multiple `Todo` entities based on the action

## TodoOperation Entity

**Purpose**: Represents the specific action performed on todo data, mapped to MCP tools

**Fields**:
- `id`: UUID (Primary Key) - Unique identifier for each operation
- `operation_type`: Enum (CREATE, READ, UPDATE, DELETE) - The type of database operation
- `intent_id`: UUID (Foreign Key) - Reference to the Intent that triggered this operation
- `todo_ids_affected`: Array of UUIDs - IDs of affected todo items
- `status`: Enum (SUCCESS, FAILED, PENDING) - Status of the operation
- `result_message`: String (500 chars max) - Description of the result
- `execution_time`: DateTime - When the operation was executed

**Validation Rules**:
- `operation_type` must be one of the predefined enum values
- `status` must be one of the predefined enum values
- `intent_id` must reference an existing Intent
- `execution_time` is automatically set when the operation is executed

**Relationships**:
- Connected to one `Intent` (via `intent_id`)
- Associated with multiple `Todo` entities (via `todo_ids_affected`)
- Linked to one `ChatInteraction` through Intent

## Todo Entity (Extended)

**Purpose**: The core todo entity with additional fields for chatbot integration

**Existing Fields**:
- `id`: UUID (Primary Key) - Unique identifier for each todo
- `title`: String (255 chars max) - Title of the todo
- `description`: String (1000 chars max, optional) - Detailed description
- `is_completed`: Boolean - Completion status
- `user_id`: UUID (Foreign Key) - Owner of the todo
- `created_at`: DateTime - Creation timestamp
- `updated_at`: DateTime - Last update timestamp

**Additional Fields for Chat Integration**:
- `created_via_chat`: Boolean - Whether the todo was created through chat
- `last_modified_by_chat`: Boolean - Whether the last modification was via chat

**Validation Rules**:
- `title` must be between 1 and 255 characters
- `user_id` must reference an existing authenticated user
- `is_completed` defaults to false
- `user_id` enforces data isolation (users can only access their own todos)

**Relationships**:
- Belongs to one `User` (via `user_id`)
- May be referenced by multiple `ChatInteraction` entities through `TodoOperation`
- Connected to multiple `TodoOperation` entities (via `todo_ids_affected`)

## User Entity (Referenced)

**Purpose**: Represents the authenticated user

**Key Fields**:
- `id`: UUID (Primary Key) - Unique identifier for each user
- `email`: String - Email address of the user
- `password_hash`: String - Hashed password
- `is_active`: Boolean - Account status

**Relationships**:
- Owns multiple `Todo` entities
- Initiates multiple `ChatInteraction` entities
- Connected to multiple `TodoOperation` entities through Todos

## State Transitions

### Todo Entity Transitions
- **Pending → Completed**: When user marks todo as complete (via chat or UI)
- **Completed → Pending**: When user unmarks todo as complete (via chat or UI)
- **Created → Active**: When new todo is created (via chat or UI)
- **Active → Deleted**: When user deletes the todo (via chat or UI)

### ChatInteraction Entity Transitions
- **Created → Processing**: When the system begins processing the user input
- **Processing → Processed**: When the system successfully processes the input
- **Processing → Failed**: When the system encounters an error processing the input