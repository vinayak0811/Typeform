from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.utils.ids import new_uuid


class Choice(Base):
    __tablename__ = "choices"

    id = Column(String(36), primary_key=True, default=new_uuid)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(255), nullable=False, default="")
    order = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="choices")
