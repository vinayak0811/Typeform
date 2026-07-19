"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

form_status_enum = sa.Enum("draft", "published", name="formstatus")
question_type_enum = sa.Enum(
    "short_text",
    "long_text",
    "multiple_choice",
    "email",
    "dropdown",
    "number",
    "yes_no",
    "rating",
    name="questiontype",
)


def upgrade() -> None:
    op.create_table(
        "forms",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("status", form_status_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "questions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("form_id", sa.String(36), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", question_type_enum, nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("required", sa.Boolean, nullable=False),
        sa.Column("order", sa.Integer, nullable=False),
        sa.Column("settings", sa.JSON, nullable=False),
    )
    op.create_index("ix_questions_form_id", "questions", ["form_id"])

    op.create_table(
        "choices",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("question_id", sa.String(36), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("order", sa.Integer, nullable=False),
    )
    op.create_index("ix_choices_question_id", "choices", ["question_id"])

    op.create_table(
        "responses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("form_id", sa.String(36), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed", sa.Boolean, nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_responses_form_id", "responses", ["form_id"])

    op.create_table(
        "answers",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("response_id", sa.String(36), sa.ForeignKey("responses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.String(36), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("value_text", sa.String(5000), nullable=True),
        sa.Column("value_number", sa.Float, nullable=True),
        sa.Column("choice_id", sa.String(36), sa.ForeignKey("choices.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_answers_response_id", "answers", ["response_id"])
    op.create_index("ix_answers_question_id", "answers", ["question_id"])


def downgrade() -> None:
    op.drop_table("answers")
    op.drop_table("responses")
    op.drop_table("choices")
    op.drop_table("questions")
    op.drop_table("forms")
    form_status_enum.drop(op.get_bind(), checkfirst=True)
    question_type_enum.drop(op.get_bind(), checkfirst=True)
