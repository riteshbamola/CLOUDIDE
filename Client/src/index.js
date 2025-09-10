import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithExplorer from './AppWithExplorer';
import reportWebVitals from './reportWebVitals';
import { GlobalProvider } from './context/globalContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalProvider>
      <AppWithExplorer />
    </GlobalProvider>
    
  </React.StrictMode>
);

reportWebVitals();