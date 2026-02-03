/**
 * Response Formatter - Format memories with tiered detail levels
 *
 * Critical: NEVER include embedding or vector fields in responses
 * Token targets: minimal=30, standard=200, full=500
 */
import type { Memory, DetailLevel, FormattedMemory, Entity, Provenance } from '../types/index.js';
/**
 * Format options for memory formatting
 */
export interface FormatOptions {
    entities?: Entity[];
    provenance?: Provenance[];
    tags?: string[];
}
/**
 * Format a single memory according to detail level
 *
 * @param memory - The memory to format
 * @param detailLevel - Level of detail to include
 * @param options - Optional entities, provenance, and tags
 * @returns Formatted memory (NO embeddings)
 */
export declare function formatMemory(memory: Memory, detailLevel: DetailLevel, options?: FormatOptions): FormattedMemory;
/**
 * Format a list of memories
 *
 * @param memories - Array of memories to format
 * @param detailLevel - Level of detail to include
 * @param optionsMap - Map of memory IDs to format options
 * @returns Array of formatted memories
 */
export declare function formatMemoryList(memories: Memory[], detailLevel: DetailLevel, optionsMap?: Map<string, FormatOptions>): FormattedMemory[];
/**
 * Get estimated token count for a formatted memory
 *
 * @param memory - Formatted memory to estimate
 * @returns Estimated token count
 */
export declare function getMemoryTokenCount(memory: FormattedMemory): number;
/**
 * Validate that a memory list fits within token budget
 *
 * @param memories - Array of formatted memories
 * @param maxTokens - Maximum allowed tokens
 * @returns Validation result
 */
export declare function validateMemoryBudget(memories: FormattedMemory[], maxTokens: number): {
    fits: boolean;
    estimated: number;
    count: number;
};
/**
 * Truncate memory list to fit within token budget
 *
 * @param memories - Array of formatted memories
 * @param maxTokens - Maximum token budget
 * @returns Truncated array that fits within budget
 */
export declare function truncateToTokenBudget(memories: FormattedMemory[], maxTokens: number): FormattedMemory[];
/**
 * Debug: Get token statistics for a memory
 *
 * @param memory - Formatted memory to analyze
 * @returns Token statistics
 */
export declare function getMemoryTokenStats(memory: FormattedMemory): {
    total: number;
    byField: Record<string, number>;
};
//# sourceMappingURL=response-formatter.d.ts.map