"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingNotificationProps {
  message: string;
  onClose: () => void;
}

export function LoadingNotification({
  message,
  onClose,
}: LoadingNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-[400px] rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5">
      <div className="flex gap-2">
        <p className="grow text-sm">
          <Loader2
            className="-mt-0.5 me-3 inline-flex animate-spin text-blue-500"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          {message}
        </p>
      </div>
    </div>
  );
}
