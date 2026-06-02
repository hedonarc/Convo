import { AuthProvider } from "@/providers";
import { ToastProvider } from "@/shared/ui";

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
