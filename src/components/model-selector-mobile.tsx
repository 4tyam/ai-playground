"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { models } from "@/lib/models";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";

interface ModelSelectorMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: string | undefined;
  setModel: (model: string) => void;
  currentSection: string | null;
  setCurrentSection: (section: string | null) => void;
}

// Group models by company
const groupedModels = models.reduce((acc, model) => {
  const company = model.company;
  if (!acc[company]) {
    acc[company] = [];
  }
  acc[company].push(model);
  return acc;
}, {} as Record<string, typeof models>);

// Get the first model's icon for each company
const companyIcons = Object.entries(groupedModels).reduce(
  (acc, [company, models]) => {
    acc[company] = models[0].icon;
    return acc;
  },
  {} as Record<string, string>
);

export function ModelSelectorMobile({
  open,
  onOpenChange,
  model,
  setModel,
  currentSection,
  setCurrentSection,
}: ModelSelectorMobileProps) {
  // Initialize with default model if no model is selected
  useEffect(() => {
    if (!model) {
      const defaultModel = models.find((m) => m.defaultModel)?.id;
      if (defaultModel) {
        setModel(defaultModel);
      }
    }
  }, [model, setModel]);

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    setCurrentSection(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 gap-0 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[400px] rounded-xl">
        <DialogHeader className="h-14 flex-shrink-0 flex flex-row items-center px-4 border-b">
          {currentSection ? (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8"
              onClick={() => setCurrentSection(null)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <DialogTitle>
            {currentSection ? currentSection : "Select Model"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          {!model ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading models</span>
            </div>
          ) : !currentSection ? (
            // Show companies list
            <div className="p-2">
              {Object.entries(groupedModels).map(([company]) => (
                <Button
                  key={company}
                  variant="ghost"
                  className="w-full justify-between items-center p-2.5 rounded-xl"
                  onClick={() => setCurrentSection(company)}
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={companyIcons[company]}
                      alt={company}
                      width={18}
                      height={18}
                      className={`${
                        companyIcons[company].includes("openai") ||
                        companyIcons[company].includes("anthropic")
                          ? "dark:invert"
                          : ""
                      }`}
                    />
                    <span>{company}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          ) : (
            // Show models for selected company
            <div className="p-2 space-y-1">
              {groupedModels[currentSection].map((m) => {
                const allTags = [...(m.tags || [])];

                return (
                  <Button
                    key={m.id}
                    variant="ghost"
                    className="w-full justify-start h-auto px-4 py-3 rounded-xl hover:bg-muted/50"
                    onClick={() => handleModelSelect(m.id)}
                  >
                    <div className="flex items-start gap-3 w-full min-h-[32px]">
                      <Image
                        src={m.icon}
                        alt={m.name}
                        width={20}
                        height={20}
                        className={`mt-0.5 ${
                          m.icon.includes("openai") ||
                          m.icon.includes("anthropic")
                            ? "dark:invert"
                            : ""
                        }`}
                      />
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm">
                              {m.name}
                            </span>
                            {m.info && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-2 text-sm">
                                  {m.info}
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          {model === m.id && (
                            <span className="text-primary font-bold text-base">
                              ✓
                            </span>
                          )}
                        </div>
                        {allTags.length > 0 && (
                          <div className="flex gap-1.5 mt-1">
                            {allTags.map((tag, index) => (
                              <Popover key={index}>
                                <PopoverTrigger asChild>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div
                                      className="px-1.5 py-0.5 text-xs rounded flex items-center justify-center"
                                      style={{
                                        color: tag.color,
                                        backgroundColor: `${tag.color}40`,
                                      }}
                                    >
                                      {typeof tag.icon === "string" ? (
                                        tag.icon
                                      ) : (
                                        <tag.icon className="size-3.5" />
                                      )}
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-2 text-sm">
                                  {tag.description || tag.name}
                                </PopoverContent>
                              </Popover>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
