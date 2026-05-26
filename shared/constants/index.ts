export const ROUTES = {
  CHAT: "/chat",
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  INVITE: "/invite/:token",
  PROFILE: "/profile",
} as const;

/** Mirrors apps/conversations/constants.py on the backend. */
export const MAX_MESSAGE_LENGTH = 4096;

export const API_ENDPOINTS = {
  LOGIN: "/api/login/",
  REGISTER: "/api/register/",
  LOGOUT: "/api/logout/",
  TOKEN_REFRESH: "/api/token/refresh/",
  CONVERSATIONS: "/api/conversations/",
  USERS: "/api/users/",
  INVITES: "/api/invites/",
  ME: "/api/me/",
  PRESENCE: "/api/presence/",
} as const;
