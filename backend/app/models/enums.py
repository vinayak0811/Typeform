import enum


class FormStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


class QuestionType(str, enum.Enum):
    SHORT_TEXT = "short_text"
    LONG_TEXT = "long_text"
    MULTIPLE_CHOICE = "multiple_choice"
    EMAIL = "email"
    DROPDOWN = "dropdown"
    NUMBER = "number"
    YES_NO = "yes_no"
    RATING = "rating"


# Question types that render an editable list of `Choice` rows in the builder.
CHOICE_BASED_TYPES = {QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN}
