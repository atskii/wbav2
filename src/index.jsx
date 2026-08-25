import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mobile Drag and Drop Polyfill
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// Zabezpieczenie przed przerywaniem holdToDrag przez mikro-ruchy palca
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { capture: true, passive: true });

window.addEventListener("touchmove", (e) => {
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    e.stopPropagation(); // Ukrywa mikro-ruchy przed mobile-drag-drop
  }
}, { capture: true, passive: false });

polyfill({
  holdToDrag: 500,
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

// Zapobieganie przewijaniu strony w trakcie drag and drop na mobilkach
window.addEventListener("touchmove", function() {}, { passive: false });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
