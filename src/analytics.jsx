import React from 'react';
import ReactDOM from 'react-dom/client';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('analytics-root')).render(
  <React.StrictMode>
    <AnalyticsDashboard />
  </React.StrictMode>
);
