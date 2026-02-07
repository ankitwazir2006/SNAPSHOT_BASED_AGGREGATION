
import React, { useState } from 'react';

function EventForm() {
  const [eventId, setEventId] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
      event_id: eventId,
      event_time: eventTime,
      arrival_time: new Date().toISOString(),
      value: parseFloat(value),
    };

    // Store event in localStorage
    const events = JSON.parse(localStorage.getItem('events')) || [];
    localStorage.setItem('events', JSON.stringify([...events, newEvent]));

    // Clear form
    setEventId('');
    setEventTime('');
    setValue('');

    // Dispatch a custom event to notify the SnapshotList component
    window.dispatchEvent(new Event('storage'));
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
