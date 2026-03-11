import { authService } from "@/services/auth.service";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/useToast";

import { setAccessToken } from "@/lib/axios";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  fullWidth?: boolean;
};

export default function LogoutButton({ fullWidth = false }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: (response) => {
      setAccessToken(null);
      queryClient.clear();
      navigate("/", { replace: true });
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    },
    onError: (error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  return (
    <Button
      variant="outline"
      className={fullWidth ? "w-full" : ""}
      onClick={handleLogout}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <LogOutIcon className="w-4 h-4" />
      )}
      Logout
    </Button>
  );
}
