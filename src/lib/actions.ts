"use server";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/app/auth";
import { chats, messages } from "../../db/schema";
import { db } from "../../db";

export async function getChats(page: number = 1, limit: number = 25): Promise<{
  chats: {
    id: string;
    model: string;
    title: string | null;
    createdAt: Date;
  }[];
  hasMore: boolean;
}> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * limit;

  const allChats = await db
    .select({
      id: chats.id,
      model: chats.model,
      title: chats.title,
      createdAt: chats.createdAt,
    })
    .from(chats)
    .where(eq(chats.userId, session.user.id as string))
    .orderBy(desc(chats.createdAt))
    .limit(limit + 1) // Fetch one extra to check if there are more
    .offset(offset);

  // Check if there are more chats
  const hasMore = allChats.length > limit;
  const chatsToReturn = hasMore ? allChats.slice(0, -1) : allChats;

  return {
    chats: chatsToReturn,
    hasMore,
  };
}