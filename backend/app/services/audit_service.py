import hmac
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
from app.config import settings
from app.db.sqlite_client import get_db_connection

class AuditService:
    """
    Cryptographic HMAC Hash-Chain Ledger.
    Every write to the graph or evidence store logs an audit event.
    
    Property:
    - Tamper-evident: Modifying any past record invalidates every HMAC after it.
    - Canonical JSON formatting with sorted keys ensures repeatable hashes.
    - Monotonic sequence numbers prevent reordering or omission attacks.
    """
    
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = (secret_key or settings.HMAC_SECRET_KEY).encode("utf-8")
        self._genesis_hmac = "0" * 64

    def _canonical_json(self, data: Dict[str, Any]) -> str:
        return json.dumps(data, sort_keys=True, separators=(',', ':'), default=str)

    def _compute_payload_hash(self, payload: Dict[str, Any]) -> str:
        canonical_str = self._canonical_json(payload)
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    def _compute_hmac(self, prev_hmac: str, sequence_number: int, event_type: str, actor_id: str, target_id: str, payload_hash: str, timestamp: str) -> str:
        chain_message = f"{sequence_number}:{event_type}:{actor_id}:{target_id}:{payload_hash}:{timestamp}:{prev_hmac}"
        return hmac.new(self.secret_key, chain_message.encode("utf-8"), hashlib.sha256).hexdigest()

    def get_latest_event(self) -> Tuple[int, str]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT sequence_number, hmac FROM audit_log ORDER BY sequence_number DESC LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if row:
            return row["sequence_number"], row["hmac"]
        return 0, self._genesis_hmac

    def log_event(self, event_type: str, actor_id: str, target_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        last_seq, prev_hmac = self.get_latest_event()
        current_seq = last_seq + 1
        timestamp = datetime.now(timezone.utc).isoformat()
        payload_hash = self._compute_payload_hash(payload)
        event_hmac = self._compute_hmac(prev_hmac, current_seq, event_type, actor_id, target_id, payload_hash, timestamp)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_log (
                sequence_number, event_type, actor_id, target_id,
                payload_hash, prev_event_hmac, hmac, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (current_seq, event_type, actor_id, target_id, payload_hash, prev_hmac, event_hmac, timestamp))
        conn.commit()
        conn.close()

        return {
            "sequence_number": current_seq,
            "event_type": event_type,
            "actor_id": actor_id,
            "target_id": target_id,
            "payload_hash": payload_hash,
            "prev_event_hmac": prev_hmac,
            "hmac": event_hmac,
            "timestamp": timestamp
        }

    def verify_chain(self) -> Dict[str, Any]:
        """
        Verifies the mathematical integrity of the entire audit chain.
        Returns verification report.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_log ORDER BY sequence_number ASC")
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return {"valid": True, "verified": True, "total_records": 0, "status": "empty"}

        prev_hmac = self._genesis_hmac
        for idx, row in enumerate(rows):
            expected_seq = idx + 1
            if row["sequence_number"] != expected_seq:
                return {
                    "valid": False,
                    "verified": False,
                    "error": f"Sequence discontinuity: expected {expected_seq}, found {row['sequence_number']}",
                    "broken_at_sequence": row["sequence_number"]
                }

            if row["prev_event_hmac"] != prev_hmac:
                return {
                    "valid": False,
                    "verified": False,
                    "error": f"Hash chain broken at sequence {row['sequence_number']}: prev_event_hmac mismatch",
                    "broken_at_sequence": row["sequence_number"]
                }

            recomputed_hmac = self._compute_hmac(
                prev_hmac=row["prev_event_hmac"],
                sequence_number=row["sequence_number"],
                event_type=row["event_type"],
                actor_id=row["actor_id"],
                target_id=row["target_id"],
                payload_hash=row["payload_hash"],
                timestamp=row["timestamp"]
            )

            if recomputed_hmac != row["hmac"]:
                return {
                    "valid": False,
                    "verified": False,
                    "error": f"Tampered record at sequence {row['sequence_number']}: HMAC mismatch",
                    "broken_at_sequence": row["sequence_number"]
                }

            prev_hmac = row["hmac"]

        return {
            "valid": True,
            "verified": True,
            "total_records": len(rows),
            "latest_hmac": prev_hmac,
            "status": "verified_intact"
        }

audit_service = AuditService()
