"use client";

import { Dispatch, SetStateAction } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { AlertTriangleIcon, EyeIcon } from "lucide-react";

import { Button } from "./ui/button";

type Props = {
  showSpoilerWarning: boolean;
  setShowSpoilerWarning: Dispatch<SetStateAction<boolean>>;
  setSpoilersRevealed: Dispatch<SetStateAction<boolean>>;
};

export default function SpoilerWarningModal({
  showSpoilerWarning,
  setShowSpoilerWarning,
  setSpoilersRevealed
}: Props) {
  const confirmRevealSpoilers = () => {
    setSpoilersRevealed(true);
    setShowSpoilerWarning(false);
  };

  return (
    <Dialog open={showSpoilerWarning} onOpenChange={setShowSpoilerWarning}>
      <DialogContent className="bg-white/90 backdrop-blur-xl border border-white/40 text-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <AlertTriangleIcon className="text-orange-500" size={24} />
            Spoiler Warning
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            This review contains spoilers that may reveal important plot points,
            character developments, or story outcomes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-700 text-sm">
            Are you sure you want to reveal the spoilers? Once revealed, they
            cannot be hidden again during this session.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSpoilerWarning(false)}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={confirmRevealSpoilers}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <EyeIcon size={16} />
            Reveal Spoilers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
