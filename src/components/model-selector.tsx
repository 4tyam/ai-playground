"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { models } from "@/lib/models";
import Image from "next/image";
import { Info, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { ModelSelectorMobile } from "./model-selector-mobile";

interface ModelSelectorProps {
  model: string | undefined;
  setModel: (model: string) => void;
  disabled?: boolean;
  showModelName?: boolean;
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

// Get the first model's icon for each company to use as company icon
const companyIcons = Object.entries(groupedModels).reduce(
  (acc, [company, models]) => {
    acc[company] = models[0].icon;
    return acc;
  },
  {} as Record<string, string>
);

export function ModelSelector({
  model,
  setModel,
  disabled = false,
  showModelName = false,
}: ModelSelectorProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const renderModelButtonContent = () => {
    if (!model) {
      return (
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading</span>
        </div>
      );
    }

    const currentModel = models.find((m) => m.id === model);
    return (
      <>
        {currentModel?.icon && (
          <Image
            src={currentModel.icon}
            alt="Model icon"
            width={15}
            height={15}
            draggable={false}
            className={`${
              currentModel.icon.includes("openai") ||
              currentModel.icon.includes("anthropic")
                ? "dark:invert"
                : ""
            }`}
          />
        )}
        {!disabled && (showModelName ? currentModel?.name : "Models")}
      </>
    );
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          className="text-gray-600 h-8 hover:text-gray-700 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px] rounded-full shrink-0 text-xs px-3 py-1 inline-flex items-center gap-1.5"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {renderModelButtonContent()}
        </Button>

        <ModelSelectorMobile
          open={open}
          onOpenChange={setOpen}
          model={model}
          setModel={setModel}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
      </>
    );
  }

  // Return existing dropdown for desktop
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="text-gray-600 h-8 hover:text-gray-700 dark:text-gray-300/75 dark:hover:text-gray-300 dark:bg-[#18181B] dark:border-[1.5px] rounded-full shrink-0 text-xs px-3 py-1 inline-flex items-center gap-1.5"
          disabled={disabled}
        >
          {renderModelButtonContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[200px] rounded-xl"
        align="start"
        side={isMobile ? "top" : "right"}
      >
        {Object.entries(groupedModels).map(([company, companyModels]) => (
          <DropdownMenuSub key={company}>
            <DropdownMenuSubTrigger className="p-2.5 cursor-pointer rounded-xl flex items-center">
              <Image
                src={companyIcons[company]}
                alt={company}
                width={18}
                height={18}
                className={`mr-2 ${
                  companyIcons[company].includes("openai") ||
                  companyIcons[company].includes("anthropic")
                    ? "dark:invert"
                    : ""
                }`}
              />
              {company}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-[280px] rounded-xl">
              {companyModels.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  className="p-3 cursor-pointer rounded-xl flex items-start gap-2"
                  onClick={() => setModel(m.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Image
                      src={m.icon}
                      alt={m.name}
                      width={18}
                      height={18}
                      className={`${
                        m.icon.includes("openai") ||
                        m.icon.includes("anthropic")
                          ? "dark:invert"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{m.name}</span>
                      {m.info && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="max-w-[200px]"
                            >
                              {m.info}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {model === m.id && (
                        <span className="ml-auto text-primary font-bold text-base">
                          ✓
                        </span>
                      )}
                    </div>
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-1">
                        {m.tags.map((tag, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <div
                                  className="px-1.5 py-0.5 text-xs rounded flex items-center justify-center"
                                  style={{
                                    color: tag.color,
                                    backgroundColor: `${tag.color}40`, // 40% opacity
                                  }}
                                >
                                  {typeof tag.icon === "string" ? (
                                    tag.icon
                                  ) : (
                                    <tag.icon className="size-3.5" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              {tag.description && (
                                <TooltipContent side="right">
                                  {tag.description}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
