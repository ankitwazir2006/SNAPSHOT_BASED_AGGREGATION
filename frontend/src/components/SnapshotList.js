import React, { useState, useEffect } from 'react';
import MetricsChart from './MetricsChart';

function SnapshotList() {
  const [snapshots, setSnapshots] = useState([]);

  const processEventsAndGenerateSnapshots = () => {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const dailyMetrics = {};

    // Sort events by arrival time to process them in order
    events.sort((a, b) => new Date(a.arrival_time) - new Date(b.arrival_time));

    // Keep track of processed event IDs to handle duplicates
    const processedEventIds = new Set();

    // Generate a snapshot for each event
    const newSnapshots = events.map(event => {
      if (processedEventIds.has(event.event_id)) {
        // If the event is a duplicate, return null and filter it out later
        return null;
      }

      processedEventIds.add(event.event_id);

      const day = new Date(event.event_time).toISOString().split('T')[0];
      if (!dailyMetrics[day]) {
        dailyMetrics[day] = { value: 0, count: 0 };
      }
      dailyMetrics[day].value += event.value;
      dailyMetrics[day].count += 1;

      // Create a deep copy of the dailyMetrics to store in the snapshot
      const snapshotMetrics = JSON.parse(JSON.stringify(dailyMetrics));

      return {
        timestamp: event.arrival_time,
        daily_metrics: snapshotMetrics,
      };
    }).filter(Boolean); // Filter out nulls from duplicate events

    setSnapshots(newSnapshots.reverse()); // Reverse to show latest snapshots first
  };

  useEffect(() => {
    // Initial processing of events
    processEventsAndGenerateSnapshots();

    // Listen for the custom 'storage' event dispatched from EventForm
    const handleStorageChange = () => {
      processEventsAndGenerateSnapshots();
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper function to get the latest snapshot for each day
  const getLatestDailySnapshots = () => {
    const latestSnapshots = {};
    snapshots.forEach(snapshot => {
      Object.keys(snapshot.daily_metrics).forEach(day => {
        if (!latestSnapshots[day]) {
          latestSnapshots[day] = snapshot;
        }
      });
    });
    return latestSnapshots;
  };

  const latestDailySnapshots = getLatestDailySnapshots();

  return (
    <div className="dashboard">
      <MetricsChart snapshots={snapshots} />
      <h2>Daily Metric Snapshots</h2>
      <p>The latest snapshot for each day is provisional. All others are final.</p>
      <div className="snapshot-grid">
        {Object.entries(latestDailySnapshots).map(([day, snapshot]) => {
          const metrics = snapshot.daily_metrics[day];
          const isProvisional = snapshot === snapshots[0]; // The very latest snapshot is provisional

          return (
            <div key={day} className="snapshot-card">
              <h3>{day}</h3>
              <p>Total Value: {metrics.value}</p>
              <p>Event Count: {metrics.count}</p>
              <p>Status: <span style={{ color: isProvisional ? '#ffc107' : '#28a745' }}>
                {isProvisional ? 'Provisional' : 'Final'}
              </span></p>
              <p>Last Updated: {new Date(snapshot.timestamp).toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SnapshotList;
