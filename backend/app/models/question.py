from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.enums import QuestionType
from app.utils.ids import new_uuid


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=new_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(SAEnum(QuestionType), nullable=False)
    title = Column(String(500), nullable=False, default="")
    description = Column(String(1000), nullable=True, default="")
    required = Column(Boolean, nullable=False, default=False)
    order = Column(Integer, nullable=False, default=0)

    # Flexible per-type settings, e.g. {"max_rating": 5} for RATING,
    # {"placeholder": "you@example.com"} for EMAIL/SHORT_TEXT, etc.
    settings = Column(JSON, nullable=False, default=dict)

    form = relationship("Form", back_populates="questions")
    choices = relationship(
        "Choice",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="Choice.order",
    )
    answers = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete-orphan",
    )
