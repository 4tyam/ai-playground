"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "5 AI chats per day",
      "Access to basic models",
      "Standard response time",
      "Basic file uploads",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$20",
    period: "month",
    features: [
      "Unlimited AI chats",
      "Access to all models",
      "Priority response time",
      "Advanced file uploads",
      "API access",
      "Priority support",
    ],
    highlight: true,
  },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Pricing</DialogTitle>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border-0 sm:mx-6">
        <div className="relative flex flex-col max-h-[calc(100vh-2rem)] overflow-y-auto">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-[100%] bg-[linear-gradient(to_right,#0061ff,#60efff)] opacity-20 animate-[rotate_10s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="text-center px-4 py-6 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold">Upgrade your plan</h2>
            </div>

            {/* Plans */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 p-4 sm:p-6 lg:p-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl p-4 sm:p-6 backdrop-blur-xl ${
                    plan.highlight
                      ? "border-2 border-[#0061FF] bg-card/40"
                      : "border border-border bg-muted/5"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full bg-[#0061FF] text-white text-xs font-medium">
                      Popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm sm:text-base text-muted-foreground ml-1">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#0061FF]" />
                        <span className="text-sm sm:text-base text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`mt-4 sm:mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                      plan.current
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "bg-[#0061FF] text-white hover:bg-[#0061FF]/90 transition-colors"
                    }`}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
