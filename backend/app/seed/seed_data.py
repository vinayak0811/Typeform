"""
Seeds the database with demo data — two users, each with their own starter
forms, so the "Published forms" and "My forms" sections (and cross-user
scoping) all have something real to look at out of the box:
  - demo@formly.app   / demopass123   — 2 published + 1 draft, with responses
  - jane@formly.app    / demopass123   — 2 published + 1 draft, with responses

Run with:  python -m app.seed.seed_data
"""
import random
from datetime import datetime, timedelta, timezone

from app.database.session import Base, engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.form import Form
from app.models.response import Response
from app.models.answer import Answer
from app.models.enums import QuestionType
from app.services.onboarding import create_starter_forms


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


SAMPLE_NAMES = ["Alice Johnson", "Bob Smith", "Carla Diaz", "David Lee", "Emma Wilson",
                 "Frank Chen", "Grace Kim", "Henry Patel", "Isla Brown", "Jack Nguyen"]


def seed_responses(db, form: Form, count: int):
    questions = sorted(form.questions, key=lambda q: q.order)
    for i in range(count):
        completed = random.random() > 0.15
        response = Response(
            form_id=form.id,
            completed=completed,
            submitted_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 4), hours=random.randint(0, 23)),
        )
        db.add(response)
        db.flush()

        name = SAMPLE_NAMES[i % len(SAMPLE_NAMES)]
        for question in questions:
            if not completed and random.random() > 0.6:
                continue  # simulate a partial/abandoned response

            answer = Answer(response_id=response.id, question_id=question.id)

            if question.type == QuestionType.SHORT_TEXT:
                answer.value_text = name
            elif question.type == QuestionType.EMAIL:
                answer.value_text = f"{name.split()[0].lower()}@example.com"
            elif question.type == QuestionType.LONG_TEXT:
                answer.value_text = random.choice([
                    "Really enjoying the product so far, keep up the good work!",
                    "The new dashboard is much faster than before.",
                    "Would love to see more integrations in the future.",
                    "",
                ])
            elif question.type == QuestionType.RATING:
                max_r = (question.settings or {}).get("max_rating", 5)
                answer.value_number = random.randint(max(1, max_r - 3), max_r)
            elif question.type == QuestionType.NUMBER:
                answer.value_number = random.randint(0, 5)
            elif question.type == QuestionType.YES_NO:
                answer.value_text = random.choice(["yes", "no"])
            elif question.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
                if question.choices:
                    answer.choice_id = random.choice(question.choices).id

            db.add(answer)
        db.flush()


DEMO_USERS = [
    {"name": "Demo User", "email": "demo@formly.app", "password": "demopass123"},
    {"name": "Jane Cooper", "email": "jane@formly.app", "password": "demopass123"},
]


def seed_user(db, name: str, email: str, password: str):
    user = User(name=name, email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)

    published, extra_published, draft = create_starter_forms(db, user.id)
    db.refresh(published)
    db.refresh(extra_published)
    seed_responses(db, published, random.randint(4, 8))
    seed_responses(db, extra_published, random.randint(3, 6))
    db.commit()
    return user


def run():
    reset_db()
    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            seed_user(db, u["name"], u["email"], u["password"])

        print(f"Seed complete: {len(DEMO_USERS)} users, each with 2 published forms, 1 draft form, and sample responses.")
        for u in DEMO_USERS:
            print(f"  login -> email: {u['email']}  password: {u['password']}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
