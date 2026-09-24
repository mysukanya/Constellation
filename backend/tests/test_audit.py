import pytest
from app.db.sqlite_client import init_sqlite_db, get_db_connection
from app.dependencies import create_initial_users
from app.services.audit_service import AuditService, audit_service
from app.config import settings

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

def test_audit_valid_chain():
    report = audit_service.verify_chain()
    assert report["valid"] is True
    assert report["verified"] is True
    assert report["status"] == "verified_intact"
    assert report["total_records"] > 0

def test_audit_append_record():
    initial_report = audit_service.verify_chain()
    initial_count = initial_report["total_records"]

    event = audit_service.log_event(
        event_type="TEST_AUDIT_APPEND",
        actor_id="test_agent",
        target_id="target_append_1",
        payload={"action": "append_test", "detail": "verify hash chain"}
    )
    assert event["sequence_number"] == initial_count + 1

    post_report = audit_service.verify_chain()
    assert post_report["valid"] is True
    assert post_report["total_records"] == initial_count + 1
    assert post_report["latest_hmac"] == event["hmac"]

def test_audit_tampered_payload_detected():
    # Insert an event
    event = audit_service.log_event(
        event_type="TEST_TAMPER_TARGET",
        actor_id="test_agent",
        target_id="target_tamper_1",
        payload={"sensitive_data": "original_value"}
    )
    seq = event["sequence_number"]

    # Tamper with the payload_hash in the database directly
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE audit_log SET payload_hash = ? WHERE sequence_number = ?", ("0" * 64, seq))
    conn.commit()
    conn.close()

    # Verification must detect the tampering
    report = audit_service.verify_chain()
    assert report["valid"] is False
    assert report["verified"] is False
    assert report["broken_at_sequence"] == seq
    assert "Tampered record" in report["error"]

    # Revert for subsequent tests
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE audit_log SET payload_hash = ? WHERE sequence_number = ?", (event["payload_hash"], seq))
    conn.commit()
    conn.close()

def test_audit_tampered_prev_hmac_detected():
    event = audit_service.log_event(
        event_type="TEST_TAMPER_PREV",
        actor_id="test_agent",
        target_id="target_tamper_2",
        payload={"test": "prev_hmac"}
    )
    seq = event["sequence_number"]

    # Tamper with the prev_event_hmac in the database directly
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE audit_log SET prev_event_hmac = ? WHERE sequence_number = ?", ("f" * 64, seq))
    conn.commit()
    conn.close()

    # Verification must detect the broken chain
    report = audit_service.verify_chain()
    assert report["valid"] is False
    assert report["broken_at_sequence"] == seq
    assert "Hash chain broken" in report["error"]

    # Revert
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE audit_log SET prev_event_hmac = ? WHERE sequence_number = ?", (event["prev_event_hmac"], seq))
    conn.commit()
    conn.close()

def test_audit_incorrect_secret_fails():
    # Verifying an existing valid database with a different secret must fail
    wrong_audit_service = AuditService(secret_key="completely_wrong_secret_key_123456789")
    report = wrong_audit_service.verify_chain()
    assert report["valid"] is False
    assert report["verified"] is False
    assert report["broken_at_sequence"] == 1
    assert "HMAC mismatch" in report["error"]

def test_audit_broken_sequence_detected():
    # Add a record with a gap in sequence number
    last_seq, prev_hmac = audit_service.get_latest_event()
    gap_seq = last_seq + 5  # gap!

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_log (
            sequence_number, event_type, actor_id, target_id,
            payload_hash, prev_event_hmac, hmac, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (gap_seq, "GAP_EVENT", "test_actor", "target_gap", "a" * 64, prev_hmac, "b" * 64, "2026-09-24T00:00:00Z"))
    conn.commit()
    conn.close()

    report = audit_service.verify_chain()
    assert report["valid"] is False
    assert "Sequence discontinuity" in report["error"]

    # Clean up gap record
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM audit_log WHERE sequence_number = ?", (gap_seq,))
    conn.commit()
    conn.close()
