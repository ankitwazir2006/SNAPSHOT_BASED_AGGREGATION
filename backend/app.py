# Progressive Snapshot-Based Aggregation System - Backend

# Backend API for handling event ingestion, duplicate detection, and metric aggregation.

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
from collections import defaultdict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})

# In-memory storage for events, snapshots, and daily aggregation
events = []
snapshots = []
daily_aggregates = defaultdict(dict)

# Event model (replace with database schema in production)
class Event:
    def __init__(self, event_id, event_time, arrival_time, value):
        self.event_id = event_id
        self.event_time = event_time
        self.arrival_time = arrival_time
        self.value = value

def ingest_event(event_id, event_time, arrival_time, value):
    logger.debug(f"Checking for duplicate event_id: {event_id}")
    
    # Check for duplicate events
    for event in events:
        if event.event_id == event_id:
            logger.warning(f"Duplicate event detected: {event_id}")
            return "Duplicate event detected", 409
    
    # Create new event
    new_event = Event(event_id, event_time, arrival_time, value)
    events.append(new_event)
    logger.info(f"Event {event_id} added to events list")
    
    # Update daily aggregates incrementally
    day_key = event_time.date()
    logger.debug(f"Updating daily aggregates for day: {day_key}")
    
    if day_key not in daily_aggregates:
        daily_aggregates[day_key] = {"value": 0, "count": 0}
        logger.debug(f"Initialized new day entry for {day_key}")
    
    daily_aggregates[day_key]["value"] += value
    daily_aggregates[day_key]["count"] += 1
    logger.info(f"Daily aggregates updated for {day_key}. New value: {daily_aggregates[day_key]['value']}, count: {daily_aggregates[day_key]['count']}")
    
    return "Event ingested successfully", 200

def generate_snapshot():
    logger.info("Generating new snapshot of daily aggregates")
    
    # Create snapshot of current daily aggregates
    snapshot = {
        "timestamp": datetime.utcnow().isoformat(),
        "daily_metrics": {}
    }
    
    # Copy current state of daily aggregates
    for day, metrics in daily_aggregates.items():
        snapshot["daily_metrics"][str(day)] = {
            "value": metrics["value"],
            "count": metrics["count"]
        }
        logger.debug(f"Added day {day} to snapshot with value {metrics['value']} and count {metrics['count']}")
    
    snapshots.append(snapshot)
    logger.info(f"Snapshot generated successfully with {len(snapshot['daily_metrics'])} day entries")
    return "Snapshot generated successfully"

@app.route("/ingest", methods=["POST"])
def ingest():
    # Validate request content type
    if not request.is_json:
        logger.warning("Non-JSON request received")
        return jsonify({"error": "Request must be JSON"}), 415
    
    # Validate required fields
    data = request.json
    required_fields = ["event_id", "event_time", "arrival_time", "value"]
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        logger.warning(f"Missing fields in request: {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate and parse timestamps
    try:
        event_time = datetime.fromisoformat(data["event_time"])
        arrival_time = datetime.fromisoformat(data["arrival_time"])
    except ValueError as e:
        logger.warning(f"Invalid timestamp format: {str(e)}")
        return jsonify({"error": "Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS)"}), 400
    
    # Validate value is numeric
    try:
        value = float(data["value"])
    except (ValueError, TypeError):
        logger.warning(f"Invalid value format: {data['value']}")
        return jsonify({"error": "Value must be a number"}), 400
    
    # Validate event_time <= arrival_time
    if event_time > arrival_time:
        logger.warning(f"Event time {event_time} is after arrival time {arrival_time}")
        return jsonify({"error": "Event time cannot be after arrival time"}), 400
    
    # Process the event
    event_id = data["event_id"]
    logger.info(f"Processing event {event_id} with value {value}")
    
    response, status = ingest_event(event_id, event_time, arrival_time, value)
    logger.info(f"Event {event_id} processed with status {status}")
    
    return jsonify({"message": response}), status

@app.route("/snapshot", methods=["POST"])
def generate():
    result = generate_snapshot()
    return jsonify({"message": result}), 200

@app.route("/snapshots", methods=["GET"])
def get_snapshots():
    return jsonify(snapshots), 200

@app.route("/daily", methods=["GET"])
def get_daily():
    # Convert daily aggregates to serializable format
    daily_data = {str(day): metrics for day, metrics in daily_aggregates.items()}
    return jsonify(daily_data), 200

if __name__ == "__main__":
    app.run(debug=True, port=3001)
