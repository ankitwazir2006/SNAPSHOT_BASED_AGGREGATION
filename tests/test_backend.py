import pytest
from datetime import datetime, date
from progressive_snapshot_aggregation.backend.app import app, ingest_event, generate_snapshot, events, snapshots, daily_aggregates

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_ingest_event():
    # Clear existing data
    events.clear()
    daily_aggregates.clear()
    
    # Test successful ingestion
    result, status = ingest_event(
        "test1", 
        datetime(2023, 1, 1, 12, 0), 
        datetime(2023, 1, 1, 12, 0), 
        10
    )
    assert result == "Event ingested successfully"
    assert status == 201
    assert len(events) == 1
    assert date(2023, 1, 1) in daily_aggregates
    assert daily_aggregates[date(2023, 1, 1)]["value"] == 10

    # Test duplicate detection
    result, status = ingest_event(
        "test1", 
        datetime(2023, 1, 1, 12, 0), 
        datetime(2023, 1, 1, 12, 0), 
        10
    )
    assert result == "Duplicate event detected"
    assert status == 409
    assert len(events) == 1  # No new event added

def test_generate_snapshot():
    # Clear existing data
    events.clear()
    snapshots.clear()
    daily_aggregates.clear()
    
    # Add test event
    ingest_event(
        "test1", 
        datetime(2023, 1, 1, 12, 0), 
        datetime(2023, 1, 1, 12, 0), 
        10
    )
    
    # Generate snapshot
    result = generate_snapshot()
    assert result == "Snapshot generated successfully"
    assert len(snapshots) == 1
    assert snapshots[0]["daily_metrics"]["2023-01-01"]["value"] == 10

def test_late_event_handling():
    # Clear existing data
    events.clear()
    snapshots.clear()
    daily_aggregates.clear()
    
    # Ingest initial event
    ingest_event(
        "test1", 
        datetime(2023, 1, 1, 12, 0), 
        datetime(2023, 1, 1, 12, 0), 
        10
    )
    
    # Generate first snapshot
    generate_snapshot()
    first_value = snapshots[0]["daily_metrics"]["2023-01-01"]["value"]
    
    # Ingest late event for same day
    ingest_event(
        "test2", 
        datetime(2023, 1, 1, 15, 0),  # Event occurred on same day
        datetime(2023, 1, 2, 10, 0),  # But arrived next day
        20
    )
    
    # Generate second snapshot
    generate_snapshot()
    second_value = snapshots[1]["daily_metrics"]["2023-01-01"]["value"]
    
    # Verify the late event was incorporated
    assert second_value == 30  # 10 + 20
    assert first_value == 10  # Original value unchanged in first snapshot