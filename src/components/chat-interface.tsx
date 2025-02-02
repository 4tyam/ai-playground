"use client";

import {
  Plus,
  ImageIcon,
  SendHorizonalIcon,
  MicIcon,
  SparklesIcon,
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {titleShown && (
        <h2 className="text-2xl sm:text-3xl font-semibold text-center tracking-tight fixed sm:static top-1/2 sm:top-auto sm:transform-none -translate-y-1/2 left-0 w-full sm:w-auto sm:mb-6">
          Chat with {getModelName(model)}
        </h2>
      )}

      <Card className="dark:bg-[#18181B]">
        <CardContent className="p-3.5" onClick={handleCardClick}>
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
              <DropdownMenu>
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
                  <DropdownMenuItem className="p-2.5 cursor-pointer rounded-xl">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload image
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
