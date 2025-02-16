export type MessageContent = {
  type: "text" | "image";
  text?: string;
  image?: string;
};

export type Message = {
  id: string;
  content: string | MessageContent[];
  role: "user" | "assistant" | "system";
  sentAt: Date;
  pending?: boolean;
};

export type CachedData = {
  messages: Message[];
  model: string;
};
