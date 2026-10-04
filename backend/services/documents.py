"""Loads the registry of supported documents."""

from pathlib import Path

from pydantic import TypeAdapter

from models.document import DocumentSpec


def load_documents(path: Path) -> dict[str, DocumentSpec]:
    """Read documents.json into specs keyed by document id."""
    specs = TypeAdapter(list[DocumentSpec]).validate_json(path.read_text())
    return {spec.id: spec for spec in specs}
