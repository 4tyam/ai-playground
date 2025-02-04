"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";
import { chats, messages } from "../../db/schema";
import { db } from "../../db";

export async function getChats(): Promise<{
  id: string;
  model: string;
  title: string | null;
}[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const allChats = await db
    .select({
      id: chats.id,
      model: chats.model,
      title: chats.title,
    })
    .from(chats)
    .where(eq(chats.userId, session.user.id as string));

  return allChats;
}