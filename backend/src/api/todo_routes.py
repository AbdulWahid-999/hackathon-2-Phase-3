from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..database.connection import get_session
from ..models.todo import Todo, TodoCreate, TodoRead, TodoUpdate
from ..services.todo_service import TodoService
from ..exceptions import TodoNotFoundException
from ..middleware.auth import require_auth
from ..models.user import User

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[TodoRead])
def get_todos(
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """
    Retrieve all todos for the authenticated user.
    Implements GET /todos endpoint as specified in API contract.
    """
    todo_service = TodoService(session)
    return todo_service.get_all_todos(current_user.id)

@router.post("/", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """
    Create a new todo item for the authenticated user.
    Implements POST /todos endpoint as specified in API contract.
    """
    todo_service = TodoService(session)
    return todo_service.create_todo(todo_data, current_user.id)

from uuid import UUID

@router.get("/{todo_id}", response_model=TodoRead)
def get_todo(
    todo_id: UUID,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """
    Retrieve a specific todo by ID for the authenticated user.
    Implements GET /todos/{id} endpoint as specified in API contract.
    """
    todo_service = TodoService(session)
    try:
        return todo_service.get_todo_by_id(todo_id, current_user.id)
    except TodoNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.put("/{todo_id}", response_model=TodoRead)
def update_todo(
    todo_id: UUID,
    todo_update: TodoUpdate,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """
    Update an existing todo for the authenticated user.
    Implements PUT /todos/{id} endpoint as specified in API contract.
    """
    todo_service = TodoService(session)
    try:
        return todo_service.update_todo(todo_id, todo_update, current_user.id)
    except TodoNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: UUID,
    current_user: User = Depends(require_auth),
    session: Session = Depends(get_session)
):
    """
    Delete a specific todo for the authenticated user.
    Implements DELETE /todos/{id} endpoint as specified in API contract.
    """
    todo_service = TodoService(session)
    try:
        todo_service.delete_todo(todo_id, current_user.id)
        return {"success": True, "message": "Todo deleted successfully"}
    except TodoNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)