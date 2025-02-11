import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageDialogProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ src, open, onOpenChange }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] w-fit p-6 overflow-hidden border-none bg-transparent data-[state=open]:slide-in-from-center data-[state=closed]:slide-out-to-center">
        <DialogTitle className="sr-only">Uploaded Image</DialogTitle>
        <div className="relative group">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute -right-3 -top-3 z-50 rounded-full bg-background border shadow-sm p-1.5 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <Image
            src={src}
            alt="Full size preview"
            width={1920}
            height={1080}
            className="object-contain w-auto h-auto max-h-[80vh] rounded-lg"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
