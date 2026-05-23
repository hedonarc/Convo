import { ROUTES } from "@shared/constants";
import { sharedText } from "@shared/constants/strings/index.en";
import { Button } from "@shared/ui";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/providers";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      id="logout-button"
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      loading={isLoading}
      aria-label={sharedText.logoutAriaLabel}
      title={sharedText.logout}
    >
      <LogOut
        size={16}
        strokeWidth={2}
        className="text-red-500 dark:text-red-400"
      />
    </Button>
  );
}
