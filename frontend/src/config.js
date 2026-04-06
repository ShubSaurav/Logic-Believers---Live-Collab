const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'http';
const wsProtocol = apiProtocol === 'https' ? 'wss' : 'ws';
const apiHost = import.meta.env.VITE_API_HOST || browserHost;
const apiPort = import.meta.env.VITE_API_PORT || '3001';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${apiProtocol}://${apiHost}:${apiPort}`;
export const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || `${wsProtocol}://${apiHost}:${apiPort}`;