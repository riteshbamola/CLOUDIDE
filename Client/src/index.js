import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithExplorer from './AppWithExplorer';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithExplorer />
  </React.StrictMode>
);

reportWebVitals();