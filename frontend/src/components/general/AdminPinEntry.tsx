import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { KeyRound, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  isLoadingLogin: boolean;
  handleLogin: (pin1: string, pin2: string) => void;
};

export default function AdminPinEntry({ isLoadingLogin, handleLogin }: Props) {
  const [inputState, setInputState] = useState("");
  const [inputStep, setInputStep] = useState(1);
  const [pin1, setPin1] = useState("");

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

  const resetState = () => {
    setInputState("");
    setInputStep(1);
    setPin1("");
  };

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
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="absolute top-4 right-4">
          <KeyRound className="mr-2 w-4 h-4" />
          Enter admin mode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Enter admin mode</DialogTitle>
          <DialogDescription>
            Enter your pin to enter admin mode
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Input progress: {inputStep} of 2
          </p>
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
        </div>
        <DialogFooter className="flex-col gap-2">
          {inputStep === 2 && (
            <Button onClick={handlePrevious}>Previous</Button>
          )}
          <Button onClick={handlePinInput}>
            {isLoadingLogin && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {inputStep === 1 ? "Next" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
