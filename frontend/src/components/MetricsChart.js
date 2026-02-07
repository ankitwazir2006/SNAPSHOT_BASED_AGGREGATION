
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MetricsChart({ snapshots }) {
  // Process data for the chart
  const chartData = snapshots.map(snapshot => {
    let totalValue = 0;
    let totalCount = 0;

    for (const day in snapshot.daily_metrics) {
      totalValue += snapshot.daily_metrics[day].value;
      totalCount += snapshot.daily_metrics[day].count;
    }

    return {
      timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
      value: totalValue,
      count: totalCount,
    };
  }).reverse(); // Reverse to show chronological order

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>Metrics Over Time</h3>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="timestamp" stroke="#e0e0e0" />
          <YAxis yAxisId="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
            itemStyle={{ color: '#e0e0e0' }}
            labelStyle={{ color: '#e0e0e0' }}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MetricsChart;
