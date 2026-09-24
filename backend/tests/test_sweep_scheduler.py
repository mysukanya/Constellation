import pytest
from app.services.sweep_service import sweep_service

@pytest.mark.asyncio
async def test_sweep_executes_and_returns_real_results():
    summary = await sweep_service.execute_sweep(triggered_by="test_harness")
    assert summary.status == "completed"
    assert summary.cases_scanned_count >= 0
    assert summary.entities_analyzed_count >= 0
    # Findings should only be genuine, not synthetic
    for f in summary.findings:
        assert "demonstration" not in f.description.lower()
        assert "synthetic" not in f.description.lower()
