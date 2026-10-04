import json
import re

# Cover-page-only values that the NDA Standard Terms never reference.
NDA_COVER_PAGE_ONLY = {"MNDA Modifications", "Party 1", "Party 2"}


def test_registry_covers_every_catalog_template(documents, templates_dir):
    catalog = json.loads((templates_dir.parent / "catalog.json").read_text())
    filenames = {entry["filename"].removeprefix("templates/") for entry in catalog}
    registered = {doc.template for doc in documents.values()}
    assert filenames - registered == {"Mutual-NDA-coverpage.md"}


def test_field_and_party_keys_are_unique(documents):
    for doc in documents.values():
        keys = [f.key for f in doc.fields]
        assert len(keys) == len(set(keys)), doc.id
        assert len({p.key for p in doc.parties}) == len(doc.parties), doc.id


def test_fields_and_parties_appear_in_template(documents, templates_dir):
    for doc in documents.values():
        text = (templates_dir / doc.template).read_text()
        labels = set(re.findall(r'<span class="\w+_link">([^<]+)</span>', text))
        names = [f.label for f in doc.fields] + [p.label for p in doc.parties]
        missing = {n for n in names if not {n, n.removesuffix("s")} & labels} - NDA_COVER_PAGE_ONLY
        assert not missing, (doc.id, missing)
