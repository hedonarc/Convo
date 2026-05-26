import { ToastProvider } from "@shared/ui";

import { AuthProvider } from "@/providers";

import { AppRouter } from "./router";

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}
