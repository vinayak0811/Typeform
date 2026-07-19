from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.utils.ids import new_uuid


class Answer(Base):
    """
    A single answer to a single question within a response.

    Storage is deliberately split by shape so analytics queries (averages,
    choice distributions) can run as plain SQL aggregates instead of parsing
    JSON blobs:
      - value_text   -> short_text, long_text, email, yes_no ("yes"/"no")
      - value_number -> number, rating
      - choice_id    -> multiple_choice, dropdown (FK to the selected Choice)
    """
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True, default=new_uuid)
    response_id = Column(String(36), ForeignKey("responses.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)

    value_text = Column(String(5000), nullable=True)
    value_number = Column(Float, nullable=True)
    choice_id = Column(String(36), ForeignKey("choices.id", ondelete="SET NULL"), nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
    choice = relationship("Choice")
