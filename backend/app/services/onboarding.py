"""
Builds a small starter kit of forms for a given user: two published forms
(so the new "Published forms" section isn't empty) and one draft (so "My
forms" shows what an in-progress form looks like). Used by:
  - app/seed/seed_data.py, for the demo account
  - app/api/auth.py, automatically on every new registration

Keeping this in one place means the demo seed and real onboarding never
drift out of sync with each other.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.form import Form
from app.models.question import Question
from app.models.choice import Choice
from app.models.enums import FormStatus, QuestionType


def build_customer_feedback_form(db: Session, owner_id: str) -> Form:
    form = Form(
        title="Customer Feedback Survey",
        description="Help us improve our product by sharing your thoughts.",
        status=FormStatus.PUBLISHED,
        published_at=datetime.now(timezone.utc) - timedelta(days=5),
        user_id=owner_id,
    )
    db.add(form)
    db.flush()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="What's your name?",
                   description="So we know who to thank.", required=True, order=0, settings={"placeholder": "Jane Doe"})
    q2 = Question(form_id=form.id, type=QuestionType.EMAIL, title="What's your email address?",
                   required=True, order=1, settings={"placeholder": "you@example.com"})
    q3 = Question(form_id=form.id, type=QuestionType.RATING, title="How would you rate our product overall?",
                   required=True, order=2, settings={"max_rating": 5})
    q4 = Question(form_id=form.id, type=QuestionType.MULTIPLE_CHOICE, title="Which feature do you use the most?",
                   required=True, order=3, settings={})
    q5 = Question(form_id=form.id, type=QuestionType.YES_NO, title="Would you recommend us to a friend?",
                   required=False, order=4, settings={})
    q6 = Question(form_id=form.id, type=QuestionType.LONG_TEXT, title="Any additional feedback?",
                   description="We read every response.", required=False, order=5, settings={"placeholder": "Type your answer..."})
    db.add_all([q1, q2, q3, q4, q5, q6])
    db.flush()

    for idx, label in enumerate(["Dashboard", "Analytics", "Form Builder", "Integrations"]):
        db.add(Choice(question_id=q4.id, label=label, order=idx))

    db.flush()
    return form


def build_event_registration_form(db: Session, owner_id: str) -> Form:
    form = Form(
        title="Event Registration",
        description="Register for our upcoming product launch event.",
        status=FormStatus.PUBLISHED,
        published_at=datetime.now(timezone.utc) - timedelta(days=2),
        user_id=owner_id,
    )
    db.add(form)
    db.flush()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Full name", required=True, order=0, settings={})
    q2 = Question(form_id=form.id, type=QuestionType.EMAIL, title="Email address", required=True, order=1, settings={})
    q3 = Question(form_id=form.id, type=QuestionType.NUMBER, title="How many guests will you bring?",
                   required=True, order=2, settings={"min": 0, "max": 10, "placeholder": "0"})
    q4 = Question(form_id=form.id, type=QuestionType.DROPDOWN, title="Which session will you attend?",
                   required=True, order=3, settings={})
    q5 = Question(form_id=form.id, type=QuestionType.RATING, title="How excited are you for this event?",
                   required=False, order=4, settings={"max_rating": 5})
    db.add_all([q1, q2, q3, q4, q5])
    db.flush()

    for idx, label in enumerate(["Morning Keynote", "Afternoon Workshop", "Evening Networking"]):
        db.add(Choice(question_id=q4.id, label=label, order=idx))

    db.flush()
    return form


def build_draft_form(db: Session, owner_id: str) -> Form:
    form = Form(
        title="Employee Satisfaction Survey (Draft)",
        description="Internal survey — still being drafted.",
        status=FormStatus.DRAFT,
        user_id=owner_id,
    )
    db.add(form)
    db.flush()

    q1 = Question(form_id=form.id, type=QuestionType.SHORT_TEXT, title="Your department", required=True, order=0, settings={})
    q2 = Question(form_id=form.id, type=QuestionType.RATING, title="How satisfied are you at work?",
                   required=True, order=1, settings={"max_rating": 10})
    db.add_all([q1, q2])
    db.flush()
    return form


def create_starter_forms(db: Session, owner_id: str) -> list[Form]:
    """Gives a user 2 published forms + 1 draft so both the 'Published
    forms' and 'My forms' sections have something in them immediately."""
    forms = [
        build_customer_feedback_form(db, owner_id),
        build_event_registration_form(db, owner_id),
        build_draft_form(db, owner_id),
    ]
    db.commit()
    return forms
