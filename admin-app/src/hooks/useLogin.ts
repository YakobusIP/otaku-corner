import { useCallback, useEffect, useState } from "react";

import { authService } from "@/services/auth.service";

import { useToast } from "@/hooks/useToast";

import { setAuthTokens } from "@/lib/axios";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useLogin() {
  const toast = useToast();
  const navigate = useNavigate();

  const [inputState, setInputState] = useState("");
  const [inputStep, setInputStep] = useState(1);
  const [pin1, setPin1] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({ pin1: first, pin2 }: { pin1: string; pin2: string }) => {
      const response = await authService.login(first, pin2);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data) => {
      setAuthTokens(data.accessToken, data.refreshToken ?? undefined);
      navigate("/dashboard");
      toast.toast({
        title: "All set!",
        description: "Login successful"
      });
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const handleLogin = useCallback(
    async (first: string, pin2: string) => {
      loginMutation.mutate({ pin1: first, pin2 });
    },
    [loginMutation]
  );

  const handlePrevious = () => {
    setInputState(pin1);
    setInputStep(1);
  };

  const handlePinInput = useCallback(() => {
    if (inputStep === 1) {
      setPin1(inputState);
      setInputStep(2);
      setInputState("");
    } else if (inputStep === 2) {
      handleLogin(pin1, inputState);
    }
  }, [handleLogin, inputState, inputStep, pin1]);

  const handleKeyEvents = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handlePinInput();
      }

      if (
        event.key === "Backspace" &&
        inputStep === 2 &&
        inputState.length === 0
      ) {
        setInputStep(1);
        setInputState(pin1);
      }
    },
    [handlePinInput, inputState.length, inputStep, pin1]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyEvents);

    return () => {
      window.removeEventListener("keydown", handleKeyEvents);
    };
  }, [handleKeyEvents]);

  useEffect(() => {
    document.title = "Login | Otaku Corner Admin";
  }, []);

  return {
    inputState,
    setInputState,
    inputStep,
    handlePrevious,
    handlePinInput,
    isPending: loginMutation.isPending
  };
}
