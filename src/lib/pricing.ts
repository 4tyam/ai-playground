// Define pricing structure for different models (price per token)
export const MODEL_PRICING = {
  // OpenAI Models
  'gpt-4o-mini': {
    input: "0.00000015",  
    output: "0.0000006"  
  },
  'gpt-4o': {
    input: "0.0000025",
    output: "0.00001"
  },
  'o1-mini': {
    input: "0.0000011",
    output: "0.0000044"
  },
  
  // Anthropic Models
  'claude-3-5-haiku-20241022': {
    input: "0.0000008",
    output: "0.000004"
  },
  'claude-3-5-sonnet-latest': {
    input: "0.000003",
    output: "0.000015"
  },

  // Groq Models
  'deepseek-r1-distill-llama-70b': {
    input: "0.000002",
    output: "0.000002"
  },
  'mixtral-8x7b-32768': {
    input: "0.00000024",
    output: "0.00000024"
  },
  'llama-3.1-8b-instant': {
    input: "0.0000005",
    output: "0.0000005"
  },
  'llama-3.3-70b-versatile': {
    input: "0.00000059",
    output: "0.0000008"
  },

  // Google Models
  'gemini-2.0-flash-exp': {
    input: "0.00000025",
    output: "0.0000003"
  }
} as const;

/**
 * Calculate the cost with high precision for a given model and token usage
 * @param model - The model ID
 * @param promptTokens - Number of input tokens
 * @param completionTokens - Number of output tokens
 * @returns Cost as a string with high precision
 */
export const calculateCost = (
  model: string,
  promptTokens: number,
  completionTokens: number
): string => {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  if (!pricing) {
    throw new Error(`No pricing found for model: ${model}`);
  }

  // Calculate cost per token with high precision
  const inputCost = (BigInt(promptTokens) * BigInt(Math.pow(10, 20)) * BigInt(Math.floor(Number(pricing.input) * Math.pow(10, 20)))) / BigInt(Math.pow(10, 20));
  const outputCost = (BigInt(completionTokens) * BigInt(Math.pow(10, 20)) * BigInt(Math.floor(Number(pricing.output) * Math.pow(10, 20)))) / BigInt(Math.pow(10, 20));
  
  const totalCost = (inputCost + outputCost).toString();
  
  // Format to maintain 20 decimal places
  const integerPart = totalCost.slice(0, -20) || "0";
  const decimalPart = totalCost.slice(-20).padStart(20, "0");
  
  return `${integerPart}.${decimalPart}`;
}; 