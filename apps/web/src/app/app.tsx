import { AuthProvider } from "../providers/auth.provider";
import { AppRouter } from "./router";

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
