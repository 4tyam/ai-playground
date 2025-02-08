"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { models } from "@/lib/models";
import { Info } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "./ui/separator";

export function ModelInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        What model should I choose? <Info className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-md max-h-[60vh] overflow-y-auto rounded-xl">
        <DialogHeader className="pb-2">
          <DialogTitle>Choosing the Right Model</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-6">
          {models.map((model) => (
            <div key={model.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <Image
                  src={model.icon}
                  alt={model.name}
                  width={20}
                  height={20}
                  className={`mt-1 ${
                    model.icon.includes("openai") ||
                    model.icon.includes("anthropic")
                      ? "dark:invert"
                      : ""
                  }`}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{model.name}</h3>
                  {model.info && (
                    <p className="text-sm text-muted-foreground">
                      {model.info}
                    </p>
                  )}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {model.tags.map((tag, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
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
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
