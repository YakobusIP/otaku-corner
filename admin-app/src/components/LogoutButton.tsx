import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/useToast";

import { clearClientAuth } from "@/lib/axios";
import { cn } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  fullWidth?: boolean;
  className?: string;
};

export default function LogoutButton({ fullWidth = false, className }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: (result) => {
      clearClientAuth();
      queryClient.clear();
      navigate("/", { replace: true });
      if (result?.success) {
        toast.toast({
          title: "Signed out",
          description: result.data.message || "Logged out successfully"
        });
      } else {
        toast.toast({
          title: "Signed out",
          description:
            "Your session was cleared on this device. The server could not be reached to clear the remote session."
        });
      }
    }
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  return (
    <Button
      variant="outline"
      aria-label="Logout"
      className={cn(fullWidth && "w-full", className)}
      onClick={handleLogout}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" />
      ) : (
        <LogOutIcon className="h-4 w-4 shrink-0" />
      )}
      <span className="group-data-[collapsible=icon]:hidden">Logout</span>
    </Button>
  );
}
