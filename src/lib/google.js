export const GOOGLE_CLIENT_ID = (
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  ''
).trim();

export const GOOGLE_AUTH_ENABLED = !!GOOGLE_CLIENT_ID;
