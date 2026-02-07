import React, { useState } from 'react';

function EventForm() {
  const [eventId, setEventId] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Send event to backend API
    const response = await fetch('/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        event_time: eventTime,
        arrival_time: arrivalTime,
        value: value,
      }),
    });

    if (response.ok) {
      console.log('Event ingested successfully');
    } else {
      console.error('Failed to ingest event');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Event ID:
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Event Time:
          <input
            type="datetime-local"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Arrival Time:
          <input
            type="datetime-local"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Value:
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Ingest Event</button>
    </form>
  );
}

export default EventForm;
