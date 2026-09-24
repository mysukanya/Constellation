import pytest
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.services.er_service import er_service

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

@pytest.mark.asyncio
async def test_er_exact_email_match():
    e1 = {
        "id": "e_email_1",
        "label": "Person",
        "properties": {"full_name": "Marcus Vance", "email": "mvance@syndicate.org"}
    }
    e2 = {
        "id": "e_email_2",
        "label": "Person",
        "properties": {"full_name": "Marcus Vance", "email": "mvance@syndicate.org"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is not None
    assert match["confidence"] >= 0.90
    assert match["comparison_details"]["email"]["match"] is True
    assert match["comparison_details"]["splink_fellegi_sunter"]["engine"] == "Splink 4 (DuckDB)"

@pytest.mark.asyncio
async def test_er_exact_phone_match():
    e1 = {
        "id": "e_phone_1",
        "label": "Person",
        "properties": {"full_name": "Jonathan Archer", "phone": "+1-555-0199"}
    }
    e2 = {
        "id": "e_phone_2",
        "label": "Person",
        "properties": {"full_name": "Jon Archer", "phone": "+1-555-0199"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is not None
    assert match["confidence"] >= 0.85
    assert match["comparison_details"]["phone"]["match"] is True
    assert match["supporting_evidence_count"] >= 2

@pytest.mark.asyncio
async def test_er_minor_name_variation():
    e1 = {
        "id": "e_name_1",
        "label": "Person",
        "properties": {"full_name": "Alexander Hamilton", "email": "ah@treasury.gov"}
    }
    e2 = {
        "id": "e_name_2",
        "label": "Person",
        "properties": {"full_name": "Alex Hamilton", "email": "ah@treasury.gov"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is not None
    assert match["confidence"] >= 0.85
    assert match["comparison_details"]["full_name"]["gamma"] >= 1

@pytest.mark.asyncio
async def test_er_missing_fields():
    # Only names present, no phone or email
    e1 = {
        "id": "e_miss_1",
        "label": "Person",
        "properties": {"full_name": "Tariq Merchant"}
    }
    e2 = {
        "id": "e_miss_2",
        "label": "Person",
        "properties": {"full_name": "Tariq Merchant"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is not None
    assert match["confidence"] >= 0.50
    assert "phone" not in match["comparison_details"]

@pytest.mark.asyncio
async def test_er_conflicting_fields():
    # Same name but completely different phone and email
    e1 = {
        "id": "e_conf_1",
        "label": "Person",
        "properties": {"full_name": "John Smith", "phone": "+1-555-1111", "email": "jsmith1@corp.com"}
    }
    e2 = {
        "id": "e_conf_2",
        "label": "Person",
        "properties": {"full_name": "John Smith", "phone": "+1-555-9999", "email": "jsmith2@other.org"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    # Conflicting phone and email in Fellegi-Sunter should drive confidence below threshold
    assert match is None or match["confidence"] < 0.40

@pytest.mark.asyncio
async def test_er_clearly_unrelated_entities():
    e1 = {
        "id": "e_unrel_1",
        "label": "Person",
        "properties": {"full_name": "Alice Cooper", "phone": "+1-555-1234", "email": "alice@rock.com"}
    }
    e2 = {
        "id": "e_unrel_2",
        "label": "Person",
        "properties": {"full_name": "Bob Marley", "phone": "+1-555-8765", "email": "bob@reggae.com"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is None

@pytest.mark.asyncio
async def test_er_duplicate_record_handling():
    e1 = {
        "id": "e_dup_1",
        "label": "Person",
        "properties": {"full_name": "Vikram Jadhav", "phone": "+91-98201-1122", "email": "vjadhav@customs.in"}
    }
    e2 = {
        "id": "e_dup_2",
        "label": "Person",
        "properties": {"full_name": "Vikram Jadhav", "phone": "+91-98201-1122", "email": "vjadhav@customs.in"}
    }
    match = await er_service.evaluate_candidate_pair(e1, e2, case_id="test_case")
    assert match is not None
    assert match["confidence"] >= 0.95
    assert match["comparison_details"]["splink_fellegi_sunter"]["match_probability"] >= 0.95
