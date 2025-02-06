"use client";

import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { ExternalLink } from "lucide-react";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type Plan = "free" | "pro";

type PlanDetails = {
  name: string;
  description: string;
  features: string[];
  price: string;
};

const plans: Record<Plan, PlanDetails> = {
  free: {
    name: "Free",
    description: "For personal use",
    features: ["5 chats per day", "Basic models", "Email support"],
    price: "$0/month",
  },
  pro: {
    name: "Pro",
    description: "For power users",
    features: ["Unlimited chats", "All models", "Priority support"],
    price: "$10/month",
  },
};

export function BillingTab() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPlan] = useState<Plan>("free");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="rounded-lg border p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  const plan = plans[currentPlan];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-medium mb-1">Current plan</h4>
        <p className="text-sm text-muted-foreground">
          You are currently on the {plan.name} plan
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
          <p className="font-medium">{plan.price}</p>
        </div>

        <div className="mt-4 space-y-2">
          {plan.features.map((feature) => (
            <p key={feature} className="text-sm text-muted-foreground">
              • {feature}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="rounded-xl px-5 py-1 h-9">Upgrade plan</Button>
        <Button
          variant="outline"
          className="rounded-xl px-5 py-1 h-9"
          onClick={() =>
            window.open("https://billing.stripe.com/p/login/test", "_blank")
          }
        >
          Billing portal
          <ExternalLink className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  );
}
