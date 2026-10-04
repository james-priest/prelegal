"""Shared Pydantic base models and types."""

from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Uses camelCase JSON to match the frontend."""

    model_config = ConfigDict(alias_generator=to_camel, validate_by_name=True, from_attributes=True)


def utcnow() -> datetime:
    return datetime.now(UTC)


# SQLite drops the time zone; timestamps are stored in UTC, so mark them as UTC again on output.
UtcDatetime = Annotated[datetime, AfterValidator(lambda d: d if d.tzinfo else d.replace(tzinfo=UTC))]
