import React from 'react';
import ReactDOM from 'react-dom/client';
import UserAnalyticsDashboard from './components/UserAnalyticsDashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('users-root')).render(
  <React.StrictMode>
    <UserAnalyticsDashboard />
  </React.StrictMode>
);
