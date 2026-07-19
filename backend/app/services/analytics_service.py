from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.form import Form
from app.models.question import Question
from app.models.choice import Choice
from app.models.response import Response
from app.models.answer import Answer
from app.models.enums import QuestionType, CHOICE_BASED_TYPES
from app.schemas.analytics import FormAnalytics, QuestionStat, ChoiceDistributionItem

NUMERIC_TYPES = {QuestionType.NUMBER, QuestionType.RATING}
TEXT_TYPES = {QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT, QuestionType.EMAIL}


def compute_form_analytics(db: Session, form: Form) -> FormAnalytics:
    total_responses = db.execute(
        select(func.count(Response.id)).where(Response.form_id == form.id)
    ).scalar_one()

    completed_responses = db.execute(
        select(func.count(Response.id)).where(Response.form_id == form.id, Response.completed.is_(True))
    ).scalar_one()

    completion_rate = (completed_responses / total_responses * 100) if total_responses else 0.0

    question_stats: list[QuestionStat] = []

    for question in sorted(form.questions, key=lambda q: q.order):
        answered_count = db.execute(
            select(func.count(Answer.id)).where(
                Answer.question_id == question.id,
                Answer.response_id.in_(select(Response.id).where(Response.form_id == form.id)),
            )
        ).scalar_one()
        skipped_count = max(total_responses - answered_count, 0)

        stat = QuestionStat(
            question_id=question.id,
            title=question.title,
            type=question.type,
            answered_count=answered_count,
            skipped_count=skipped_count,
        )

        if question.type in CHOICE_BASED_TYPES:
            stat.choice_distribution = _choice_distribution(db, question, form)
        elif question.type == QuestionType.YES_NO:
            stat.choice_distribution = _yes_no_distribution(db, question, form)
        elif question.type in NUMERIC_TYPES:
            agg = db.execute(
                select(func.avg(Answer.value_number), func.min(Answer.value_number), func.max(Answer.value_number))
                .where(
                    Answer.question_id == question.id,
                    Answer.value_number.is_not(None),
                    Answer.response_id.in_(select(Response.id).where(Response.form_id == form.id)),
                )
            ).one()
            avg, mn, mx = agg
            stat.average = round(avg, 2) if avg is not None else None
            stat.min_value = mn
            stat.max_value = mx
        elif question.type in TEXT_TYPES:
            samples = db.execute(
                select(Answer.value_text)
                .where(
                    Answer.question_id == question.id,
                    Answer.value_text.is_not(None),
                    Answer.value_text != "",
                    Answer.response_id.in_(select(Response.id).where(Response.form_id == form.id)),
                )
                .order_by(Answer.id.desc())
                .limit(5)
            ).scalars().all()
            stat.sample_answers = list(samples)

        question_stats.append(stat)

    return FormAnalytics(
        form_id=form.id,
        total_responses=total_responses,
        completed_responses=completed_responses,
        completion_rate=round(completion_rate, 1),
        question_stats=question_stats,
    )


def _choice_distribution(db: Session, question: Question, form: Form) -> list[ChoiceDistributionItem]:
    rows = db.execute(
        select(Choice.id, Choice.label, func.count(Answer.id))
        .outerjoin(
            Answer,
            (Answer.choice_id == Choice.id)
            & (Answer.response_id.in_(select(Response.id).where(Response.form_id == form.id))),
        )
        .where(Choice.question_id == question.id)
        .group_by(Choice.id, Choice.label, Choice.order)
        .order_by(Choice.order)
    ).all()

    total = sum(count for _, _, count in rows) or 1
    return [
        ChoiceDistributionItem(
            choice_id=choice_id,
            label=label,
            count=count,
            percentage=round(count / total * 100, 1),
        )
        for choice_id, label, count in rows
    ]


def _yes_no_distribution(db: Session, question: Question, form: Form) -> list[ChoiceDistributionItem]:
    rows = db.execute(
        select(Answer.value_text, func.count(Answer.id))
        .where(
            Answer.question_id == question.id,
            Answer.value_text.is_not(None),
            Answer.response_id.in_(select(Response.id).where(Response.form_id == form.id)),
        )
        .group_by(Answer.value_text)
    ).all()

    counts = {"yes": 0, "no": 0}
    for value_text, count in rows:
        if value_text in counts:
            counts[value_text] = count

    total = sum(counts.values()) or 1
    return [
        ChoiceDistributionItem(
            choice_id="yes",
            label="Yes",
            count=counts["yes"],
            percentage=round(counts["yes"] / total * 100, 1),
        ),
        ChoiceDistributionItem(
            choice_id="no",
            label="No",
            count=counts["no"],
            percentage=round(counts["no"] / total * 100, 1),
        ),
    ]
