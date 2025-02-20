import { BrainIcon, ImageIcon, LucideIcon, ZapIcon } from "lucide-react";

export type Provider = "openai" | "anthropic" | "groq" | "google";

export type Model = {
  name: string;
  defaultModel?: boolean;
  id: string;
  icon: string;
  provider: Provider;
  company: string;
  supportsFiles: boolean;
  maxTokens?: number;
  systemPrompt?: string;
  pricing: {
    input: string;
    output: string;
  };
  info?: string;
  tags?: {
    name: string;
    color: string;
    icon: string | LucideIcon;
    description?: string;
  }[];
  color?: string;
};

export const models: Model[] = [
  {
    name: "GPT-4o mini",
    id: "gpt-4o-mini",
    icon: "/ai-models/openai.svg",
    provider: "openai",
    company: "OpenAI",
    supportsFiles: true,
    maxTokens: 8000,
    pricing: {
      input: "0.00000015",
      output: "0.0000006",
    },
    info: "Smaller, faster version of GPT-4",
    tags: [
      {
        name: "Price",
        icon: "$",
        color: "#0BA37F",
      },
      {
        name: "Image upload",
        description: "Supports image upload",
        icon: ImageIcon,
        color: "#2196F3",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "GPT-4o",
    id: "gpt-4o",
    icon: "/ai-models/openai.svg",
    provider: "openai",
    company: "OpenAI",
    supportsFiles: true,
    maxTokens: 1500,
    pricing: {
      input: "0.0000025",
      output: "0.00001",
    },
    info: "OpenAI's flagship model. Good general purpose model",
    tags: [
      {
        name: "Price",
        icon: "$$",
        color: "#0BA37F",
      },
      {
        name: "Image upload",
        description: "Supports image upload",
        icon: ImageIcon,
        color: "#2196F3",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "o1-mini",
    id: "o1-mini",
    icon: "/ai-models/openai.svg",
    provider: "openai",
    company: "OpenAI",
    supportsFiles: false,
    maxTokens: 3000,
    pricing: {
      input: "0.0000011",
      output: "0.0000044",
    },
    info: "OpenAI's mini reasoning model",
    tags: [
      {
        name: "Price",
        icon: "$$$",
        color: "#0BA37F",
      },
      {
        name: "Reasoning",
        description: "Supports reasoning",
        icon: BrainIcon,
        color: "#9C27B0",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Claude 3.5 Haiku",
    id: "claude-3-5-haiku-20241022",
    icon: "/ai-models/anthropic.svg",
    provider: "anthropic",
    company: "Anthropic",
    supportsFiles: false,
    maxTokens: 3000,
    pricing: {
      input: "0.0000008",
      output: "0.000004",
    },
    info: "Smaller, faster and more cost effective Anthropic model",
    tags: [
      {
        name: "Price",
        icon: "$$",
        color: "#0BA37F",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Claude 3.5 Sonnet",
    id: "claude-3-5-sonnet-latest",
    icon: "/ai-models/anthropic.svg",
    provider: "anthropic",
    company: "Anthropic",
    supportsFiles: true,
    maxTokens: 1250,
    pricing: {
      input: "0.000003",
      output: "0.000015",
    },
    info: "Anthropic's flagship model. Best model for coding",
    tags: [
      {
        name: "Price",
        icon: "$$$",
        color: "#0BA37F",
      },
      {
        name: "Image upload",
        description: "Supports image upload",
        icon: ImageIcon,
        color: "#2196F3",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Deepseek R1 Distilled",
    id: "deepseek-r1-distill-llama-70b",
    icon: "/ai-models/deepseek.png",
    provider: "groq",
    company: "DeepSeek",
    supportsFiles: false,
    maxTokens: 10000,
    pricing: {
      input: "0.000002",
      output: "0.000002",
    },
    info: "A faster version of Deepseek R1, distilled on Llama 3.3 70B running on groq hardware in US datacenters",
    tags: [
      {
        name: "Price",
        icon: "$$",
        color: "#0BA37F",
      },
      {
        name: "Speed",
        description: "Very fast model",
        icon: ZapIcon,
        color: "#FFA726",
      },
      {
        name: "Reasoning",
        description: "Supports reasoning",
        icon: BrainIcon,
        color: "#9C27B0",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Mixtral 8x7B",
    id: "mixtral-8x7b-32768",
    icon: "/ai-models/mistral.svg",
    provider: "groq",
    company: "Mistral",
    supportsFiles: false,
    maxTokens: 25000,
    pricing: {
      input: "0.00000024",
      output: "0.00000024",
    },
    info: "Open source model by Mistral outperforming Llama 2 70B on most benchmarks with 6x faster inference",
    tags: [
      {
        name: "Price",
        icon: "$",
        color: "#0BA37F",
      },
      {
        name: "Speed",
        description: "Very fast model",
        icon: ZapIcon,
        color: "#FFA726",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Llama 3.1 8B",
    id: "llama-3.1-8b-instant",
    icon: "/ai-models/meta.svg",
    provider: "groq",
    company: "Meta",
    supportsFiles: false,
    maxTokens: 8000,
    pricing: {
      input: "0.0000005",
      output: "0.0000005",
    },
    info: "Faster, smaller open source model by meta for super fast tasks",
    tags: [
      {
        name: "Price",
        icon: "$",
        color: "#0BA37F",
      },
      {
        name: "Speed",
        description: "Very fast model",
        icon: ZapIcon,
        color: "#FFA726",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Llama 3.3 70B",
    id: "llama-3.3-70b-specdec",
    icon: "/ai-models/meta.svg",
    provider: "groq",
    company: "Meta",
    supportsFiles: false,
    maxTokens: 8192,
    pricing: {
      input: "0.00000059",
      output: "0.00000099",
    },
    info: "Open source model by meta running on groq hardware. Not as accurate as GPT-4o or Claude",
    tags: [
      {
        name: "Price",
        icon: "$",
        color: "#0BA37F",
      },
      {
        name: "Speed",
        description: "Very fast model",
        icon: ZapIcon,
        color: "#FFA726",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Gemini 2.0 Flash",
    defaultModel: true,
    id: "gemini-2.0-flash",
    icon: "/ai-models/googlegemini.svg",
    provider: "google",
    company: "Google",
    supportsFiles: true,
    maxTokens: 20000,
    pricing: {
      input: "0.0000001",
      output: "0.0000004",
    },
    info: "Google's latest flagship model",
    tags: [
      {
        name: "Price",
        icon: "$$",
        color: "#0BA37F",
      },
      {
        name: "Image upload",
        description: "Supports image upload",
        icon: ImageIcon,
        color: "#2196F3",
      },
    ],
    color: "#0061FF",
  },
  {
    name: "Gemini 2.0 Flash Lite Preview",
    id: "gemini-2.0-flash-lite-preview-02-05",
    icon: "/ai-models/googlegemini.svg",
    provider: "google",
    company: "Google",
    supportsFiles: true,
    maxTokens: 40000,
    pricing: {
      input: "0.00000005",
      output: "0.0000002",
    },
    info: "Google's experimental lite model. Very fast",
    tags: [
      {
        name: "Price",
        icon: "$",
        color: "#0BA37F",
      },
      {
        name: "Image upload",
        description: "Supports image upload",
        icon: ImageIcon,
        color: "#2196F3",
      },
      {
        name: "Speed",
        description: "Very fast model",
        icon: ZapIcon,
        color: "#FFA726",
      },
    ],
    color: "#0061FF",
  },
];
