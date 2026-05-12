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

import { useLogin } from "@/hooks/useLogin";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2Icon } from "lucide-react";

export default function Login() {
  const {
    inputState,
    setInputState,
    inputStep,
    handlePrevious,
    handlePinInput,
    isPending
  } = useLogin();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full">
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
              {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
              {inputStep === 1 ? "Next" : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
