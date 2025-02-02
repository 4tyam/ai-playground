"use client";

import {
  Plus,
  FileIcon,
  SendHorizonalIcon,
  MicIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useDropzone } from 'react-dropzone';

type FilePreview = {
  url: string;
  type: 'image' | 'pdf' | 'xlsx' | 'other';
  name: string;
  fileType?: string;
};

const ACCEPTED_IMAGE_TYPES = {
  'image/*': []
};

const ACCEPTED_DOCUMENT_TYPES = {
  'application/pdf': [],
  'application/msword': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // .docx
  'application/vnd.ms-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], // .xlsx
  'text/plain': []
};

export default function ChatInterface({
  titleShown,
  modelsShown,
}: {
  titleShown: boolean;
  modelsShown: boolean;
}) {
  const isMobile = useIsMobile();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [model, setModel] = useState("gpt-4o-mini");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const models = [
    {
      name: "GPT-4o mini",
      id: "gpt-4o-mini",
      icon: "/ai-models/openai.svg",
    },
    {
        name: "GPT-4o",
        id: "gpt-4o",
        icon: "/ai-models/openai.svg",
      },
    {
      name: "o3-mini",
      id: "o3-mini",
      icon: "/ai-models/openai.svg",
    },
    {
        name: "Deepseek R1 Distilled",
        id: "deepseek-r1-distill-llama-70b",
        icon: "/ai-models/deepseek.png",
      },
    {
      name: "Claude 3.5 Haiku",
      id: "claude-3-5-haiku",
      icon: "/ai-models/anthropic.svg",
    },
    {
      name: "Claude 3.5 Sonnet",
      id: "claude-3-5-sonnet",
      icon: "/ai-models/anthropic.svg",
    },
    {
        name: "Mixtral 8x7B",
        id: "mixtral-8x7b-32768",
        icon: "/ai-models/mistral.svg",
      },
    {
        name: "Llama 3.3 70B",
        id: "llama-3.3-70b-versatile	",
        icon: "/ai-models/meta.svg",
      },
    {
      name: "Gemini 2.0 Flash",
      id: "gemini-2.0-flash-exp",
      icon: "/ai-models/googlegemini.svg",
    },
  ];

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
    textarea.style.height = "auto";
    // Much smaller max height for mobile
    const maxHeight = isMobile ? 80 : 160;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // TODO: Add your submit logic here
      console.log('Submitting message:', inputRef.current?.value);
    }
  };

  const handleFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => [...prev, {
          url: reader.result as string,
          type: 'image',
          name: file.name
        }]);
        setSelectedImages(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setFilePreviews(prev => [...prev, {
        url: URL.createObjectURL(file),
        type: 'pdf',
        name: file.name
      }]);
      setSelectedImages(prev => [...prev, file]);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      fileExtension === 'xlsx' ||
      fileExtension === 'xls'
    ) {
      setFilePreviews(prev => [...prev, {
        url: '/placeholders/excel.png',
        type: 'xlsx',
        name: file.name
      }]);
      setSelectedImages(prev => [...prev, file]);
    } else {
      setFilePreviews(prev => [...prev, {
        url: '',
        type: 'other',
        name: file.name,
        fileType: fileExtension?.toUpperCase() || 'FILE'
      }]);
      setSelectedImages(prev => [...prev, file]);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const remainingSlots = 4 - filePreviews.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    if (acceptedFiles.length > remainingSlots) {
      toast.error('Maximum 4 files allowed');
    }

    filesToAdd.forEach(handleFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...ACCEPTED_IMAGE_TYPES,
      ...ACCEPTED_DOCUMENT_TYPES
    },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {titleShown && (
        <h2 className="text-2xl sm:text-3xl font-semibold text-center tracking-tight fixed sm:static top-1/2 sm:top-auto sm:transform-none -translate-y-1/2 left-0 w-full sm:w-auto sm:mb-6">
          Chat with {getModelName(model)}
        </h2>
      )}

      <Card className={`dark:bg-[#18181B] ${isDragActive ? 'ring-2 ring-primary' : ''}`}>
        <CardContent 
          className="p-3.5 relative" 
          onClick={handleCardClick}
          {...getRootProps()}
        >
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
                  <div key={index} className="relative inline-block w-[175px] h-[125px]">
                    {preview.type === 'pdf' ? (
                      <div className="w-full h-full rounded-lg flex flex-col items-center justify-center overflow-hidden">
                        <iframe
                          src={`${preview.url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full bg-white scale-110"
                          style={{ border: 'none' }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-xs text-white">
                          PDF
                        </div>
                      </div>
                    ) : preview.type === 'xlsx' ? (
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
                    ) : preview.type === 'image' ? (
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
                        if (preview.type === 'pdf') {
                          URL.revokeObjectURL(preview.url);
                        }
                        setSelectedImages(prev => prev.filter((_, i) => i !== index));
                        setFilePreviews(prev => prev.filter((_, i) => i !== index));
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
          
          <ScrollArea className="min-h-[35px] max-h-[80px] sm:max-h-[160px]">
            <Textarea
              ref={inputRef}
              placeholder={`Message ${getModelName(model)}`}
              className="border-none p-0 min-h-[24px] w-full placeholder:text-sm text-sm placeholder:text-muted-foreground/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onInput={handleTextareaInput}
              onKeyDown={handleKeyDown}
              wrap="soft"
              rows={1}
            />
          </ScrollArea>

          <div className="flex items-center gap-1.5 mt-3">
            <TooltipProvider>
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 shrink-0 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px]"
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
                      if (selectedImages.length >= 4) {
                        toast.error('Maximum 4 files allowed');
                        return;
                      }
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = Object.keys({...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOCUMENT_TYPES}).join(',');
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
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

              {modelsShown && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-gray-600 h-8 hover:text-gray-700 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px] rounded-full shrink-0 text-xs px-3 py-1 inline-flex items-center gap-1.5"
                    >
                      <Image
                        src={models.find(m => m.id === model)?.icon || ''}
                        alt="Model icon"
                        width={15}
                        height={15}
                        className={`${
                          models.find(m => m.id === model)?.icon.includes('openai') || 
                          models.find(m => m.id === model)?.icon.includes('anthropic')
                            ? 'dark:invert'
                            : ''
                        }`}
                      />
                      Models
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[200px] rounded-xl"
                    align="start"
                    side={isMobile ? "top" : "right"}
                  >
                    {models.map((m) => (
                      <DropdownMenuItem
                        key={m.id}
                        className="p-2.5 cursor-pointer rounded-xl flex items-center"
                        onClick={() => setModel(m.id)}
                      >
                        <Image
                          src={m.icon}
                          alt={m.name}
                          width={18}
                          height={18}
                          className={`mr-1 ${
                            m.icon.includes('openai') || m.icon.includes('anthropic') 
                              ? 'dark:invert' 
                              : ''
                          }`}
                        />
                        {m.name}
                        {model === m.id && <span className="ml-auto">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 shrink-0 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px]"
                  >
                    <MicIcon className="size-3" />
                    <span className="sr-only">Voice input</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Voice input</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex-1" />

                  <Button
                    size="icon"
                    className="rounded-full size-9 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 shrink-0"
                  >
                    <SendHorizonalIcon className="size-4 text-white dark:text-black" />
                    <span className="sr-only">Send</span>
                  </Button>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground" draggable={false}>
        AI models can make mistakes. Check important info.
      </p>
    </div>
  );
}
