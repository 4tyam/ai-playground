"use client";

import { useState, useRef, useEffect } from "react";
import { MicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { LoadingNotification } from "./ui/loading-notification";
import { useIsMobile } from "@/hooks/use-mobile";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

export function VoiceInput({ onTranscription }: VoiceInputProps) {
  const isMobile = useIsMobile();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [showLoadingNotification, setShowLoadingNotification] = useState(false);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      // Request final data before stopping
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const handleMicClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        // Close the media stream
        stream.getTracks().forEach((track) => track.stop());

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");
          formData.append("model", "whisper-1");

          setShowLoadingNotification(true);

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Failed to transcribe audio");
          }

          const data = await response.json();

          // First update the transcription
          onTranscription(data.text);

          // Then wait a short moment before hiding the loading notification
          // to ensure the text has been rendered
          setTimeout(() => {
            setShowLoadingNotification(false);
          }, 1000); // Increased from 800ms to 1000ms
        } catch (error) {
          console.error("Transcription error:", error);
          setShowLoadingNotification(false);
          toast.error("Failed to transcribe audio");
        }
      };

      // Start recording with 1-second intervals
      mediaRecorder.start(1000);
      setIsRecording(true);

      // Force stop after 20 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
          toast.info("Recording stopped");
        }
      }, 60000);
    } catch (error) {
      console.error("Mic permission error:", error);
      setShowLoadingNotification(false);
      toast.error("Please allow microphone access to use voice input");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const button = (
    <Button
      variant="outline"
      size="icon"
      className={`rounded-full size-8 shrink-0 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px] ${
        isRecording
          ? "bg-destructive dark:bg-destructive hover:bg-destructive dark:hover:bg-destructive text-white hover:text-white dark:hover:text-white"
          : ""
      }`}
      onClick={handleMicClick}
    >
      <MicIcon className="size-3" />
      <span className="sr-only">Voice input</span>
    </Button>
  );

  return (
    <>
      {isMobile ? (
        button
      ) : (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isRecording ? "Stop recording" : "Voice input"}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showLoadingNotification && (
        <LoadingNotification
          message="Loading"
          onClose={() => setShowLoadingNotification(false)}
        />
      )}
    </>
  );
}
