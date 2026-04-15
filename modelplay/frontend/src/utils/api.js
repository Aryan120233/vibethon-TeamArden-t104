/**
 * API configuration — reads from Vite env variables in production,
 * falls back to localhost for local development.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8000';
