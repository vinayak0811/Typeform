from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.enums import FormStatus
from app.utils.ids import new_uuid


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Form(Base):
    __tablename__ = "forms"

    id = Column(String(36), primary_key=True, default=new_uuid)
    # Nullable so any forms created before auth was added keep working;
    # every form created going forward is always assigned an owner.
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="Untitled Form")
    description = Column(String(1000), nullable=True, default="")
    status = Column(SAEnum(FormStatus), nullable=False, default=FormStatus.DRAFT)

    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", back_populates="forms")
    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.order",
    )
    responses = relationship(
        "Response",
        back_populates="form",
        cascade="all, delete-orphan",
    )
