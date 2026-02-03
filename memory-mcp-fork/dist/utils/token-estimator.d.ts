/**
 * Token Estimation Utilities
 *
 * Simple heuristic-based token counting for response formatting
 * Uses the rule of thumb: ~4 characters per token
 */
/**
 * Estimate token count for text or JSON object
 *
 * @param input - Text string or object to estimate
 * @returns Estimated token count
 */
export declare function estimateTokens(input: string | object): number;
/**
 * Validate that memories fit within a token budget
 *
 * @param memories - Array of formatted memories
 * @param maxTokens - Maximum token budget
 * @returns Validation result with estimated token count
 */
export declare function validateTokenBudget(memories: unknown[], maxTokens: number): {
    fits: boolean;
    estimated: number;
};
/**
 * Filter memories to fit within a token budget
 *
 * @param memories - Array of memories (any format)
 * @param maxTokens - Maximum token budget
 * @returns Filtered array that fits within budget
 */
export declare function fitWithinBudget<T extends object>(memories: T[], maxTokens: number): T[];
//# sourceMappingURL=token-estimator.d.ts.map