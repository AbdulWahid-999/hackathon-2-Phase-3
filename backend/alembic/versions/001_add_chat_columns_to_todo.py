"""Add chat columns to todo table

Revision ID: 001
Revises:
Create Date: 2026-02-08 08:30:00

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
import uuid
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add the missing columns to the todo table
    op.add_column('todo', sa.Column('created_via_chat', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('todo', sa.Column('last_modified_by_chat', sa.Boolean(), nullable=False, server_default='0'))


def downgrade():
    # Remove the columns in case of rollback
    op.drop_column('todo', 'created_via_chat')
    op.drop_column('todo', 'last_modified_by_chat')