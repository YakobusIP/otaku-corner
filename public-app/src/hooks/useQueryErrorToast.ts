import { useEffect } from "react";

import { toast } from "sonner";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const useQueryErrorToast = (error: unknown) => {
  useEffect(() => {
    if (!error) return;
    toast.error("Uh oh! Something went wrong", {
      description: getErrorMessage(error)
    });
  }, [error]);
};
