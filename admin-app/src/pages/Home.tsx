import { useCallback, useEffect, useState } from "react";

import { login } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp";

import { useToast } from "@/hooks/useToast";

import { setAccessToken } from "@/lib/axios";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const [inputState, setInputState] = useState("");
  const [inputStep, setInputStep] = useState(1);
  const [pin1, setPin1] = useState("");

  const handleLogin = useCallback(
    async (pin1: string, pin2: string) => {
      setIsLoadingLogin(true);
      const response = await login(pin1, pin2);
      if (response.success) {
        setAccessToken(response.data.accessToken);
        navigate("/dashboard");
        toast.toast({
          title: "All set!",
          description: "Login successful"
        });
      } else {
        toast.toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: response.error
        });
      }
      setIsLoadingLogin(false);
    },
    [navigate, toast]
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

  return (
    <main className="flex items-center justify-center w-full min-h-screen">
      <img
        src="/hero_image_left.webp"
        className="absolute left-0 top-0 w-1/2 max-h-screen"
      />
      <img
        src="/hero_image_right.webp"
        className="absolute right-0 top-0 w-1/2 max-h-screen"
      />
      <div className="relative flex items-center justify-center w-full xl:w-1/2 mx-auto">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Otaku Corner Admin</CardTitle>
            <CardDescription>
              Enter your pin to enter Otaku Corner's admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center justify-center">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={inputState}
              onChange={(value) => setInputState(value)}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground">
              Input progress: {inputStep} of 2
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            {inputStep === 2 && (
              <Button onClick={handlePrevious} className="w-full">
                Previous
              </Button>
            )}
            <Button onClick={handlePinInput} className="w-full">
              {isLoadingLogin && (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              )}
              {inputStep === 1 ? "Next" : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
