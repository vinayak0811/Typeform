from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.utils.ids import new_uuid


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Response(Base):
    __tablename__ = "responses"

    id = Column(String(36), primary_key=True, default=new_uuid)
    form_id = Column(String(36), ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)

    completed = Column(Boolean, nullable=False, default=False)
    submitted_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

    form = relationship("Form", back_populates="responses")
    answers = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan",
    )
