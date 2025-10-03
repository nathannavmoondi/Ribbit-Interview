import '@testing-library/jest-dom';

// Silence OpenLayers warnings in jsdom (map isn't really rendered)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Olcs')) return;
  originalError(...args);
};
