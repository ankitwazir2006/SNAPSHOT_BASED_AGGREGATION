# Progressive Snapshot-Based Aggregation System

## Product Overview

### Purpose
The Progressive Snapshot-Based Aggregation System ensures accurate and trustworthy daily analytics metrics in the presence of late-arriving event data. The system incrementally updates metrics over time using snapshots instead of assuming all data arrives on time.

### Problem Statement
Traditional aggregation systems assume that all event data arrives within a fixed reporting window. In real-world distributed systems, events often arrive late, causing dashboards to show incorrect or misleading metrics. These silent inaccuracies lead to poor decisions, loss of trust, and manual correction efforts.

### Goal
To design a system that:
- Correctly handles late-arriving and out-of-order events
- Prevents silent metric corruption
- Maintains transparent and explainable historical data
- Demonstrates correctness without full reprocessing

## Features

### Event Ingestion
- Accepts events continuously
- Each event includes:
  - `event_id` (unique)
  - `event_time` (when it occurred)
  - `arrival_time` (when it was received)
  - `value` (numeric contribution)

### Duplicate Handling
- Detects duplicate events using `event_id`
- Duplicate or replayed events do not affect metrics

### Aggregation Logic
- Metrics are aggregated on a per-day basis
- The definition of a day is fixed and immutable
- Aggregation is incremental, not full recomputation

### Snapshot Management
- Generates metric snapshots at fixed intervals
- Each snapshot represents the metric value at that point in time
- Past snapshots are never modified
- Late-arriving events affect only future snapshots

### Dashboard & Visualization
- Displays daily metrics
- Allows viewing multiple snapshots per day
- Clearly indicates when metrics have changed

## Non-Functional Requirements

### Performance
- Avoids full historical reprocessing
- Snapshot updates complete within acceptable demo limits

### Reliability
- Does not lose events
- Metric updates are deterministic and repeatable

### Transparency
- All metric changes are explainable
- No silent overwrites of historical data

### Usability
- Understandable by non-technical users
- UI clearly communicates provisional vs updated metrics

## Constraints & Assumptions

### Constraints
- Events may arrive late or out of order
- Duplicate events may exist
- Limited processing time and resources
- Fixed reporting windows

### Assumptions
- Event IDs are globally unique
- Late data delay is bounded (not infinite)
- Snapshot intervals are configurable

## Failure Scenarios & Handling

### Underreported Metrics
- Late events arriving after initial aggregation are incorporated into later snapshots

### Overcounting
- Duplicate events are filtered using `event_id`

### Historical Confusion
- Snapshot history explains why metrics change over time

## MVP Definition
The Minimum Viable Product will:
- Ingest events (on-time and late)
- Perform incremental daily aggregation
- Store and display snapshots
- Prevent duplicate counting
- Demonstrate at least one late-data failure scenario and its correction

## Success Metrics
- Metrics converge to correct values over time
- No duplicate inflation occurs
- Users can understand metric changes
- Late data handling is visible and explainable

## Future Enhancements
- Configurable allowed lateness window
- Metric confidence indicators
- Automated anomaly detection
- Snapshot cleanup and compaction policies