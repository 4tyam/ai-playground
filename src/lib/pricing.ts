import { models } from './models';

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
  const modelConfig = models.find(m => m.id === model);
  if (!modelConfig) {
    throw new Error(`No pricing found for model: ${model}`);
  }

  // Calculate cost per token with high precision
  const inputCost = (BigInt(promptTokens) * BigInt(Math.pow(10, 20)) * BigInt(Math.floor(Number(modelConfig.pricing.input) * Math.pow(10, 20)))) / BigInt(Math.pow(10, 20));
  const outputCost = (BigInt(completionTokens) * BigInt(Math.pow(10, 20)) * BigInt(Math.floor(Number(modelConfig.pricing.output) * Math.pow(10, 20)))) / BigInt(Math.pow(10, 20));
  
  const totalCost = (inputCost + outputCost).toString();
  
  // Format to maintain 20 decimal places
  const integerPart = totalCost.slice(0, -20) || "0";
  const decimalPart = totalCost.slice(-20).padStart(20, "0");
  
  return `${integerPart}.${decimalPart}`;
}; 