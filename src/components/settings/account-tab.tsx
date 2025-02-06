"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserData } from "@/lib/actions";
import { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export function AccountTab() {
  const [userData, setUserData] = useState<UserData | null>(null);

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
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Separator />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="hidden sm:block h-8 w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={userData.image ?? undefined} />
          <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="text-lg font-medium">{userData.name}</h4>
          <p className="text-sm text-muted-foreground">{userData.email}</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium mb-1">Account type</h4>
            <p className="text-sm text-muted-foreground">Free account</p>
          </div>
          <Button variant="outline" className="rounded-xl px-5 py-1 h-8">
            Upgrade
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium mb-1">Delete account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <Button variant="destructive" className="rounded-xl px-5 py-1 h-8">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
