import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
