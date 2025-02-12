"use client";

import {
  Plus,
  FileIcon,
  SendHorizonalIcon,
  XIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { models } from "@/lib/models";
import MaxUsageDialog from "@/components/max-usage-dialog";
import { VoiceInput } from "@/components/voice-input";
import { ModelSelector } from "@/components/model-selector";
import { useEventEmitter } from "@/hooks/use-event-emitter";

type FilePreview = {
  url: string;
  type: "image" | "pdf" | "xlsx" | "other";
  name: string;
  fileType?: string;
};

const ACCEPTED_IMAGE_TYPES = {
  "image/*": [],
};

const ACCEPTED_DOCUMENT_TYPES = {
  "application/pdf": [],
  "application/msword": [],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [], // .docx
  "application/vnd.ms-excel": [],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // .xlsx
  "text/plain": [],
};

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

type ChatBarProps = {
  titleShown: boolean;
  modelsReadOnly: boolean;
  params?: { chatId?: string };
  selectedModel?: string;
  onMessageSent?: (
    userMessage: string,
    aiMessage: string,
    isAIResponse?: boolean
  ) => void;
};

const LOCAL_STORAGE_MODEL_KEY = "ai-playground:selected-model";

export default function ChatBar({
  titleShown,
  modelsReadOnly,
  params,
  selectedModel,
  onMessageSent,
}: ChatBarProps) {
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize with empty string to avoid hydration mismatch
  const [model, setModel] = useState("");

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMaxUsageDialog, setShowMaxUsageDialog] = useState(false);
  const [input, setInput] = useState("");

  // Handle model initialization after mount
  useEffect(() => {
    setMounted(true);

    // If selectedModel prop is provided, use it
    if (selectedModel) {
      setModel(selectedModel);
      return;
    }

    // Check localStorage
    const savedModel = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY);
    if (savedModel) {
      setModel(savedModel);
      return;
    }

    // Fall back to default model
    const defaultModel = models.find((m) => m.defaultModel)?.id;
    if (defaultModel) {
      setModel(defaultModel);
      return;
    }

    // Last resort: use first model
    setModel(models[0].id);
  }, [selectedModel]);

  // Save to localStorage when model changes
  useEffect(() => {
    if (mounted && model) {
      localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, model);
    }
  }, [model, mounted]);

  const getModelName = (modelId: string) => {
    return models.find((m) => m.id === modelId)?.name || modelId;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't focus if clicking on a button
    if ((e.target as HTMLElement).closest("button")) return;

    inputRef.current?.focus();
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleFile = (file: File) => {
    const selectedModelData = models.find((m) => m.id === model);

    if (!selectedModelData?.supportsFiles) {
      toast.error("This model doesn't support file uploads");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 4MB");
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => [
          ...prev,
          {
            url: reader.result as string,
            type: "image",
            name: file.name,
          },
        ]);
        setSelectedImages((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      setFilePreviews((prev) => [
        ...prev,
        {
          url: URL.createObjectURL(file),
          type: "pdf",
          name: file.name,
        },
      ]);
      setSelectedImages((prev) => [...prev, file]);
    } else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      fileExtension === "xlsx" ||
      fileExtension === "xls"
    ) {
      setFilePreviews((prev) => [
        ...prev,
        {
          url: "/placeholders/excel.png",
          type: "xlsx",
          name: file.name,
        },
      ]);
      setSelectedImages((prev) => [...prev, file]);
    } else {
      setFilePreviews((prev) => [
        ...prev,
        {
          url: "",
          type: "other",
          name: file.name,
          fileType: fileExtension?.toUpperCase() || "FILE",
        },
      ]);
      setSelectedImages((prev) => [...prev, file]);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const remainingSlots = 4 - filePreviews.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      toast.error("Maximum 4 files allowed");
    }

    const validFiles = filesToAdd.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 4MB limit`);
        return false;
      }
      return true;
    });

    validFiles.forEach(handleFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...ACCEPTED_IMAGE_TYPES,
      ...ACCEPTED_DOCUMENT_TYPES,
    },
    noClick: true,
    noKeyboard: true,
  });

  const handleTranscription = (text: string) => {
    setInput((prev) => prev + (prev ? " " : "") + text);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentMessage = input.trim();
    const currentModel = models.find((m) => m.id === model);

    if (!currentModel) {
      toast.error("Invalid model selected");
      return;
    }

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    onMessageSent?.(currentMessage, "", false);
    setIsLoading(true);

    try {
      // Upload images first and get their URLs
      const imageUrls = await Promise.all(
        selectedImages.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            // Parse the error message from the response
            const errorData = await response.text();

            // If status is 415, it's an unsupported format error
            if (response.status === 415) {
              throw new Error(errorData);
            }

            throw new Error("Failed to upload image");
          }

          const { urls } = await response.json();
          return urls[0]; // Take the first URL since we're uploading one file at a time
        })
      );

      // Send message with image URLs
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: currentMessage }],
          data: { imageUrls },
          model: currentModel.id,
          maxTokens: currentModel.maxTokens,
          provider: currentModel.provider,
          chatId: params?.chatId,
        }),
      });

      if (!response.ok) {
        // Check specifically for usage limit error
        if (response.status === 403) {
          setShowMaxUsageDialog(true);
          return;
        } else {
          toast.error("Failed to send message");
          return;
        }
      }

      const chatId = response.headers.get("X-Chat-Id");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = "";

      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (data.tokens) {
                accumulatedMessage += data.tokens;
                // Update the UI with the accumulated message
                onMessageSent?.(currentMessage, accumulatedMessage, true);
              }
            }
          } catch {
            // Ignore parsing errors as some chunks might be incomplete
            continue;
          }
        }
      }

      // Only redirect if we're creating a new chat (no params passed)
      if (!params?.chatId && chatId) {
        // Emit event before navigation
        useEventEmitter.emit("chats:refresh");
        router.push(`/chat/${chatId}`);
      }
    } catch (error) {
      // Show the specific error message if available
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send message");
      }
      console.error(error);
      setInput(currentMessage);
    } finally {
      setIsLoading(false);
      // Clear selected images
      setSelectedImages([]);
      setFilePreviews([]);
    }
  };

  // Add this useEffect to watch input changes
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = "auto";
      const maxHeight = isMobile ? 80 : 160;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input, isMobile]); // Depend on input and isMobile

  return (
    <div className="flex flex-col gap-2">
      {showMaxUsageDialog && (
        <MaxUsageDialog onClose={() => setShowMaxUsageDialog(false)} />
      )}

      <div className="w-full max-w-3xl mx-auto space-y-3">
        {titleShown && (
          <h2 className="text-2xl sm:text-3xl font-semibold text-center tracking-tight fixed sm:static top-1/2 sm:top-auto sm:transform-none -translate-y-1/2 left-0 w-full sm:w-auto sm:mb-6">
            Chat with {getModelName(model as string)}
          </h2>
        )}

        <Card
          className={`dark:bg-[#18181B] border ${
            isDragActive
              ? "border-dashed border-black dark:border-white"
              : isLoading
              ? "loading-border"
              : "border-border"
          } ${isLoading ? "opacity-50" : ""}`}
        >
          <CardContent
            className="p-3.5 relative"
            onClick={handleCardClick}
            {...getRootProps()}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <p className="text-loading font-medium text-lg">
                  Generating...
                </p>
              </div>
            )}
            {isDragActive && (
              <div className="absolute inset-0 bg-primary/10 rounded-lg z-10 flex items-center justify-center">
                <p className="text-primary font-medium">Drop files here</p>
              </div>
            )}
            <input {...getInputProps()} />

            {filePreviews.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-3">
                  {filePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative inline-block w-[175px] h-[125px]"
                    >
                      {preview.type === "pdf" ? (
                        <div className="w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden">
                          <iframe
                            src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full bg-white scale-110"
                            style={{ border: "none" }}
                          />
                          <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-xs text-white">
                            PDF
                          </div>
                        </div>
                      ) : preview.type === "xlsx" ? (
                        <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-emerald-500/10">
                          <Image
                            src="/placeholders/excel.png"
                            alt="Excel file"
                            width={40}
                            height={40}
                            className="mb-2"
                          />
                          <div className="bg-black/75 px-2 py-0.5 rounded text-xs text-white">
                            XLSX
                          </div>
                        </div>
                      ) : preview.type === "image" ? (
                        <Image
                          src={preview.url}
                          alt={`Uploaded file ${index + 1}`}
                          fill
                          className="rounded-lg object-cover"
                          sizes="150px"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg flex flex-col items-center justify-center bg-blue-500">
                          <div className="text-blue-500 font-medium mb-2 uppercase text-sm">
                            {preview.fileType}
                          </div>
                          <div className="bg-black/75 px-2 py-0.5 rounded text-xs text-white">
                            Document
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (preview.type === "pdf") {
                            URL.revokeObjectURL(preview.url);
                          }
                          setSelectedImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          setFilePreviews((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full transition-colors z-10"
                      >
                        <XIcon className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <ScrollArea className="min-h-[35px] max-h-[80px] sm:max-h-[160px]">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${getModelName(model as string)}`}
                  className="border-none p-0 min-h-[24px] w-full placeholder:text-sm text-sm placeholder:text-muted-foreground/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  onInput={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  wrap="soft"
                  rows={1}
                  disabled={isLoading}
                />
              </ScrollArea>

              <div className="flex items-center gap-1.5 mt-3">
                <DropdownMenu
                  open={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full size-8 shrink-0 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px]"
                      disabled={
                        isLoading ||
                        !models.find((m) => m.id === model)?.supportsFiles
                      }
                    >
                      <Plus className="size-3" />
                      <span className="sr-only">Add</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[200px] rounded-xl"
                    side={isMobile ? "top" : "bottom"}
                    align="start"
                  >
                    <DropdownMenuItem
                      className="p-2.5 cursor-pointer rounded-xl"
                      onSelect={(e) => {
                        e.preventDefault();
                        const selectedModelData = models.find(
                          (m) => m.id === model
                        );

                        if (!selectedModelData?.supportsFiles) {
                          toast.error(
                            "This model doesn't support file uploads"
                          );
                          return;
                        }

                        if (selectedImages.length >= 4) {
                          toast.error("Maximum 4 files allowed");
                          return;
                        }
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = Object.keys({
                          ...ACCEPTED_IMAGE_TYPES,
                          ...ACCEPTED_DOCUMENT_TYPES,
                        }).join(",");
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            if (file.size > MAX_FILE_SIZE) {
                              toast.error("File size must be less than 4MB");
                              return;
                            }
                            handleFile(file);
                            setDropdownOpen(false);
                          }
                        };
                        input.click();
                      }}
                    >
                      <FileIcon className="mr-0.5 h-4 w-4" />
                      Upload files
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ModelSelector
                  model={model}
                  setModel={setModel}
                  disabled={modelsReadOnly || isLoading}
                />

                <VoiceInput onTranscription={handleTranscription} />

                <div className="flex-1" />

                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full size-9 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 shrink-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 text-white dark:text-black animate-spin" />
                  ) : (
                    <SendHorizonalIcon className="size-4 text-white dark:text-black" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p
          className="text-xs text-center text-muted-foreground"
          draggable={false}
        >
          AI models can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
