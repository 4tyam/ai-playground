import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  index,
  numeric,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const roleEnum = pgEnum("role", ["user", "assistant"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  usageAmount: numeric("usageAmount", { precision: 25, scale: 20 }).notNull().default("0"),
  maxAmount: numeric("maxAmount", { precision: 25, scale: 20 }).notNull().default("0"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

// Chats table
export const chats = pgTable(
  "chat",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    model: text("model").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("chat_user_id_idx").on(table.userId)]
);

// Messages table
export const messages = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    chatId: text("chatId")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    senderId: text("senderId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    role: roleEnum("role").notNull(),
    sentAt: timestamp("sentAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("message_chat_id_idx").on(table.chatId)]
);

// Add usage tracking table
export const usageLogs = pgTable("usageLog", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageId: text("messageId")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  promptTokens: integer("promptTokens").notNull(),
  completionTokens: integer("completionTokens").notNull(),
  totalCost: numeric("totalCost", { precision: 25, scale: 20 }).notNull(), // High precision cost
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
});
