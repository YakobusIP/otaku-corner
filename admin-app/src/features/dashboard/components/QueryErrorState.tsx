import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AlertCircleIcon } from "lucide-react";

const formatQueryError = (error: unknown) =>
  error instanceof Error
    ? error.message
    : String(error ?? "Something went wrong");

type QueryErrorStateProps = {
  error: unknown;
};

export default function QueryErrorState(props: QueryErrorStateProps) {
  const message = formatQueryError(props.error);

  return (
    <Alert variant="destructive" className="border-destructive/60">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Could not load</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
