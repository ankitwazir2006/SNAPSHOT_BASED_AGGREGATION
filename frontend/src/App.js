import React from 'react';
import './App.css';
import EventForm from './components/EventForm';
import SnapshotList from './components/SnapshotList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Progressive Snapshot-Based Aggregation</h1>
      </header>
      <main>
        <EventForm />
        <SnapshotList />
      </main>
    </div>
  );
}

export default App;
