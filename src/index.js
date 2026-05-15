import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ParticipantApp from './ParticipantApp';

const params = new URLSearchParams(window.location.search);
const isParticipant =
  params.get('participant') === 'true' ||
  window.location.hostname.startsWith('assessment.');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(isParticipant ? <ParticipantApp /> : <App />);
