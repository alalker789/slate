import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { appMarkup } from './appMarkup.js';
import './styles.css';

function App() {
  const host = useRef(null);
  useEffect(() => {
    host.current.innerHTML = appMarkup;
    const script = document.createElement('script');
    script.src = '/legacy.js';
    script.async = false;
    script.onload = () => {
      // Legacy visualizers bind their controls once the complete markup exists.
      window.dispatchEvent(new Event('slate:ready'));
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, []);
  return <div ref={host} />;
}

createRoot(document.getElementById('root')).render(<App />);
