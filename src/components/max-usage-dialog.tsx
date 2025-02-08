import { Button } from "@/components/ui/button";
import { CircleAlert, X } from "lucide-react";

type MaxUsageDialogProps = {
  onClose: () => void;
};

export default function MaxUsageDialog({ onClose }: MaxUsageDialogProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto z-[100] m-4 sm:m-0 sm:max-w-[400px] rounded-xl border border-border bg-background p-4 shadow-lg shadow-black/5">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          <CircleAlert
            className="mt-0.5 shrink-0 text-red-500"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="flex grow flex-col gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Usage Limit Exceeded</p>
              <p className="text-sm text-muted-foreground">
                You have reached your maximum usage limit. Please upgrade your
                plan or add balance to continue sending messages.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Upgrade Plan</Button>
              <Button variant="outline" size="sm">
                Add balance
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
            aria-label="Close notification"
            onClick={onClose}
          >
            <X
              size={16}
              strokeWidth={2}
              className="opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
