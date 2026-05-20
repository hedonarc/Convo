/// <reference path="../../apps/web/node_modules/vite/client.d.ts" />
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // send httpOnly cookies on every request
  headers: {
    "Content-Type": "application/json",
  },
});
