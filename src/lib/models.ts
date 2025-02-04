export type Provider =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "mistral"
  | "meta"
  | "google";

export type Model = {
  name: string;
  id: string;
  icon: string;
  provider: Provider;
};

export const models: Model[] = [
  {
    name: "GPT-4o mini",
    id: "gpt-4o-mini",
    icon: "/ai-models/openai.svg",
    provider: "openai",
  },
  {
    name: "GPT-4o",
    id: "gpt-4o",
    icon: "/ai-models/openai.svg",
    provider: "openai",
  },
  {
    name: "o3-mini",
    id: "o3-mini",
    icon: "/ai-models/openai.svg",
    provider: "openai",
  },
  {
    name: "Deepseek R1 Distilled",
    id: "deepseek-r1-distill-llama-70b",
    icon: "/ai-models/deepseek.png",
    provider: "deepseek",
  },
  {
    name: "Claude 3.5 Haiku",
    id: "claude-3-5-haiku-20241022",
    icon: "/ai-models/anthropic.svg",
    provider: "anthropic",
  },
  {
    name: "Claude 3.5 Sonnet",
    id: "claude-3-5-sonnet-latest",
    icon: "/ai-models/anthropic.svg",
    provider: "anthropic",
  },
  {
    name: "Mixtral 8x7B",
    id: "mixtral-8x7b-32768",
    icon: "/ai-models/mistral.svg",
    provider: "mistral",
  },
  {
    name: "Llama 3.3 70B",
    id: "llama-3.3-70b-versatile",
    icon: "/ai-models/meta.svg",
    provider: "meta",
  },
  {
    name: "Gemini 2.0 Flash",
    id: "gemini-2.0-flash-exp",
    icon: "/ai-models/googlegemini.svg",
    provider: "google",
  },
]; 