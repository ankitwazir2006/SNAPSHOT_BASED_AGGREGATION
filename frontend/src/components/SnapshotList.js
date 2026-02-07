import React, { useState, useEffect } from 'react';

function SnapshotList() {
  const [snapshots, setSnapshots] = useState([]);
  const [dailyData, setDailyData] = useState({});

  useEffect(() => {
    // Fetch snapshots from backend API
    const fetchData = async () => {
      const snapshotsResponse = await fetch('http://localhost:3001/snapshots');
      const snapshotsData = await snapshotsResponse.json();
      setSnapshots(snapshotsData);
      
      const dailyResponse = await fetch('http://localhost:5000/daily');
      const dailyData = await dailyResponse.json();
      setDailyData(dailyData);
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h2>Metric Snapshots</h2>
      <div className="snapshot-grid">
        {snapshots.map((snapshot, index) => (
          <div key={index} className="snapshot-card">
            <h3>Snapshot {index + 1}</h3>
            <p>Timestamp: {snapshot.timestamp}</p>
            <h4>Daily Metrics:</h4>
            <ul>
              {Object.entries(snapshot.daily_metrics || {}).map(([day, metrics]) => (
                <li key={day}>
                  <strong>{day}:</strong> Value: {metrics.value}, Count: {metrics.count}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <h2>Current Daily Aggregates</h2>
      <table className="daily-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Value</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dailyData).map(([day, metrics]) => (
            <tr key={day}>
              <td>{day}</td>
              <td>{metrics.value}</td>
              <td>{metrics.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SnapshotList;
