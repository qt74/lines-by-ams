import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Set initial HTML dir based on saved language
const lang = localStorage.getItem('fm_lang') || 'en';
document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = lang;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
