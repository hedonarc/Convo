import { AuthProvider } from "@/providers";

import { AppRouter } from "./router";

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
