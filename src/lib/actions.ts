"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/app/auth";
import { chats, users, usageLogs } from "../../db/schema";
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

// Archive all chats
export async function archiveAllChats() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ archived: true })
    .where(
      and(
        eq(chats.userId, session.user.id as string),
        eq(chats.archived, false)
      )
    );
}

// Unarchive all chats
export async function unarchiveAllChats() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ archived: false })
    .where(
      and(eq(chats.userId, session.user.id as string), eq(chats.archived, true))
    );
}

// Delete all chats
export async function deleteAllChats() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(chats)
    .where(
      and(
        eq(chats.userId, session.user.id as string),
        eq(chats.archived, false)
      )
    );
}

// Get user data
export async function getUserData() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, session.user.id as string))
    .then((res) => res[0]);

  return user;
}

type UsageData = {
  currentUsage: string;
  maxUsage: string;
  percentage: number;
};

type DailyUsage = {
  date: string;
  requests: number;
  tokens: number;
};

type ModelUsage = {
  model: string;
  requests: number;
};

// Get user usage data
export async function getUserUsageData(): Promise<UsageData> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = await db
    .select({
      usageAmount: users.usageAmount,
      maxAmount: users.maxAmount,
    })
    .from(users)
    .where(eq(users.id, session.user.id as string))
    .then((res) => res[0]);

  const percentage =
    (parseFloat(user.usageAmount) / parseFloat(user.maxAmount)) * 100;

  return {
    currentUsage: user.usageAmount.toString(),
    maxUsage: user.maxAmount.toString(),
    percentage: Math.min(percentage, 100),
  };
}

// Get daily usage statistics
export async function getDailyUsage(): Promise<DailyUsage[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get last 30 days including today
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyStats = await db
    .select({
      date: sql<string>`${usageLogs.timestamp}::date`,
      requests: sql<number>`COUNT(DISTINCT ${usageLogs.messageId})`,
      tokens: sql<number>`SUM(${usageLogs.promptTokens} + ${usageLogs.completionTokens})`,
    })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.userId, session.user.id as string),
        sql`${usageLogs.timestamp} >= ${thirtyDaysAgo.toISOString()}`
      )
    )
    .groupBy(sql`${usageLogs.timestamp}::date`);

  return dailyStats;
}

// Get model usage statistics
export async function getModelUsage(): Promise<ModelUsage[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get the last 30 days of model usage
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const modelStats = await db
    .select({
      model: usageLogs.model,
      requests: sql<number>`COUNT(DISTINCT ${usageLogs.messageId})`,
    })
    .from(usageLogs)
    .where(
      and(
        eq(usageLogs.userId, session.user.id as string),
        sql`${usageLogs.timestamp} >= ${thirtyDaysAgo.toISOString()}`
      )
    )
    .groupBy(usageLogs.model)
    .orderBy(desc(sql<number>`COUNT(DISTINCT ${usageLogs.messageId})`));

  return modelStats;
}

// Search chats
export async function searchChats(query: string): Promise<
  {
    id: string;
    model: string;
    title: string | null;
    createdAt: Date;
  }[]
> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const searchResults = await db
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
        eq(chats.archived, false),
        sql`LOWER(${chats.title}) LIKE LOWER(${"%" + query + "%"})`
      )
    )
    .orderBy(desc(chats.createdAt));

  return searchResults;
}
