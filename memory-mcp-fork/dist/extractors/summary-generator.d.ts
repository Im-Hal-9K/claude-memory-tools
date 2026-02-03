/**
 * Summary Generator - Creates concise 15-20 word summaries from memory content
 *
 * Target: 15-20 words (hard limit: 25 words)
 * Strategy: Extract key entities and main idea, preserve proper nouns
 */
/**
 * Generate a concise summary from memory content
 *
 * @param content - The full memory content to summarize
 * @returns A 15-20 word summary (max 25 words)
 */
export declare function generateSummary(content: string): string;
/**
 * Validate that a summary meets requirements
 *
 * @param summary - The summary to validate
 * @returns true if valid, false otherwise
 */
export declare function validateSummary(summary: string): boolean;
/**
 * Get word count for a summary
 *
 * @param summary - The summary to count
 * @returns Number of words
 */
export declare function getSummaryWordCount(summary: string): number;
//# sourceMappingURL=summary-generator.d.ts.map