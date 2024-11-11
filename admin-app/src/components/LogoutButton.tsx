import { useState } from "react";

import { logout } from "@/services/auth.service";

import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/useToast";
import useWideScreen from "@/hooks/useWideScreen";

import { setAccessToken } from "@/lib/axios";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();
  const isWideScreen = useWideScreen();

  const handleLogout = async () => {
    setIsLoadingLogout(true);
    const response = await logout();
    if (response.success) {
      setAccessToken(null);
      navigate("/");
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLogout(false);
  };
  return (
    <Button variant="outline" onClick={handleLogout}>
      {isLoadingLogout ? (
        <Loader2Icon className="w-4 h-4 animate-spin" />
      ) : (
        <LogOutIcon className="w-4 h-4" />
      )}
      {isWideScreen && "Logout"}
    </Button>
  );
}
