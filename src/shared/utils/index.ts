import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCooldown(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    const s = seconds % 60;
    return `${minutes}m ${s < 10 ? `0${s}` : s}s`;
  }
  return `${seconds}s`;
}

export function extractApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.detail ||
      err.response?.data?.non_field_errors?.[0] ||
      (err.response?.data && Object.values(err.response.data)[0]?.[0]) ||
      fallback
    );
  }
  return fallback;
}
