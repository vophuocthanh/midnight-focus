import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMinutes } from "@/lib/format";
import { MODE_LABELS, nextMode } from "@/lib/timer";
import type { Completion } from "@/types";

interface CompletionDialogProps {
  completion: Completion | null;
  onStartNext: () => void;
  onClose: () => void;
}

export function CompletionDialog({ completion, onStartNext, onClose }: CompletionDialogProps) {
  const next = completion ? MODE_LABELS[nextMode(completion.mode)].toLowerCase() : "";

  return (
    <Dialog open={completion !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {completion && (
          <>
            <DialogHeader className="items-center text-center">
              <span className="grid size-12 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-6" aria-hidden />
              </span>
              <DialogTitle className="text-lg">{MODE_LABELS[completion.mode]} complete</DialogTitle>
              <DialogDescription>
                {formatMinutes(completion.durationSec)}
                {completion.taskTitle ? ` on ${completion.taskTitle}` : ""}.{" "}
                {completion.nextStarted ? `Your ${next} has started.` : `Ready for ${next} when you are.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              {!completion.nextStarted && <Button onClick={onStartNext}>Start {next}</Button>}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
