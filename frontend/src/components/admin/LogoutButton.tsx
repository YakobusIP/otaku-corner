import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import useWideScreen from "@/hooks/useWideScreen";
import { logout } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axios";
import { Button } from "../ui/button";
import { Loader2Icon, LogOutIcon } from "lucide-react";

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
        <Loader2Icon
          className={`h-4 w-4 animate-spin ${isWideScreen ? "mr-2" : ""}`}
        />
      ) : (
        <LogOutIcon className={`w-4 h-4 ${isWideScreen ? "mr-2" : ""}`} />
      )}
      {isWideScreen && "Logout"}
    </Button>
  );
}
