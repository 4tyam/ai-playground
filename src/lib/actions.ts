"use server";

import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/app/auth";
import { chats } from "../../db/schema";
import { db } from "../../db";

// Get all chats of a user
export async function getChats(
  page: number = 1,
  limit: number = 40,
  showArchived: boolean = false
): Promise<{
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
    .where(
      and(
        eq(chats.userId, session.user.id as string),
        eq(chats.archived, showArchived)
      )
    )
    .orderBy(desc(chats.createdAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = allChats.length > limit;
  const chatsToReturn = hasMore ? allChats.slice(0, -1) : allChats;

  return {
    chats: chatsToReturn,
    hasMore,
  };
}

// Rename Chat
export async function renameChat(chatId: string, newTitle: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ title: newTitle })
    .where(
      and(eq(chats.id, chatId), eq(chats.userId, session.user.id as string))
    );
}

// Delete Chat
export async function deleteChat(chatId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(chats)
    .where(
      and(eq(chats.id, chatId), eq(chats.userId, session.user.id as string))
    );
}

// Archive Chat
export async function archiveChat(chatId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ archived: true })
    .where(
      and(eq(chats.id, chatId), eq(chats.userId, session.user.id as string))
    );
}

// Unarchive Chat
export async function unarchiveChat(chatId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ archived: false })
    .where(
      and(eq(chats.id, chatId), eq(chats.userId, session.user.id as string))
    );
}
