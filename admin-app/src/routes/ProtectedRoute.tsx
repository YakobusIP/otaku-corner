import { ReactNode, useCallback, useEffect, useState } from "react";

import { validateToken } from "@/services/auth.service";

import { useNavigate } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const response = await validateToken();
    if (response.success) {
      setIsAuthenticated(true);
    } else {
      navigate("/unauthorized");
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
