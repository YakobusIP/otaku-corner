import { Button } from "@/components/ui/button";

type Props = {
  selectedStatusCheck?: string;
  handleFilterStatusCheck: (key?: string) => void;
};

export default function FilterStatusCheck({
  selectedStatusCheck,
  handleFilterStatusCheck
}: Props) {
  return (
    <div className="grid w-full grid-cols-2 gap-2">
      <Button
        size="sm"
        variant={selectedStatusCheck === "complete" ? "default" : "outline"}
        className="w-full"
        onClick={() =>
          handleFilterStatusCheck(
            selectedStatusCheck === "complete" ? undefined : "complete"
          )
        }
      >
        Complete
      </Button>
      <Button
        size="sm"
        variant={selectedStatusCheck === "incomplete" ? "default" : "outline"}
        className="w-full"
        onClick={() =>
          handleFilterStatusCheck(
            selectedStatusCheck === "incomplete" ? undefined : "incomplete"
          )
        }
      >
        Incomplete
      </Button>
    </div>
  );
}
