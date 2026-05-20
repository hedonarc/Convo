export const ROUTES = {
  CHAT: "/chat",
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/api/login/",
  REGISTER: "/api/register/",
  LOGOUT: "/api/logout/",
  TOKEN_REFRESH: "/api/token/refresh/",
  CONVERSATIONS: "/api/conversations/",
  USERS: "/api/users/",
  INVITES: "/api/invites/",
  ME: "/api/me/",
} as const;
