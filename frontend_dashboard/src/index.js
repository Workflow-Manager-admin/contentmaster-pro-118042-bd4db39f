import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Main index just loads App, which now includes router
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
