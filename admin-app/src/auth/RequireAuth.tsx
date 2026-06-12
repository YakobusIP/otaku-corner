import { useEffect } from "react";

import { useAuthSession } from "@/auth";
import { Outlet, useNavigate } from "react-router-dom";

export function RequireAuth() {
  const navigate = useNavigate();
  const { isPending, isError, isSuccess } = useAuthSession();

  useEffect(() => {
    if (isError) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isError, navigate]);

  if (isPending) {
    return null;
  }

  if (!isSuccess) {
    return null;
  }

  return <Outlet />;
}
