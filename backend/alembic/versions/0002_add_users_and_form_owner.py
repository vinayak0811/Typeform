"""add users table and form ownership

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # SQLite can't add a FK-bearing column with a plain ALTER TABLE — batch
    # mode rebuilds the table under the hood, which also works unchanged on
    # Postgres/MySQL, so this stays portable.
    with op.batch_alter_table("forms", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.String(36), nullable=True))
        batch_op.create_index("ix_forms_user_id", ["user_id"])
        batch_op.create_foreign_key(
            "fk_forms_user_id_users", "users", ["user_id"], ["id"], ondelete="CASCADE"
        )


def downgrade() -> None:
    with op.batch_alter_table("forms", schema=None) as batch_op:
        batch_op.drop_constraint("fk_forms_user_id_users", type_="foreignkey")
        batch_op.drop_index("ix_forms_user_id")
        batch_op.drop_column("user_id")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
