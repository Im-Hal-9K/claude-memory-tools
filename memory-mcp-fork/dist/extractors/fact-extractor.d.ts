/**
 * Fact extraction from content
 */
import type { MemoryType } from '../types/index.js';
/**
 * Check if content qualifies as a fact
 */
export declare function isFact(content: string): boolean;
/**
 * Classify memory type based on content
 */
export declare function classifyMemoryType(content: string, entities: string[]): MemoryType;
/**
 * Detect user preferences in content
 */
export declare function isUserPreference(content: string): boolean;
/**
 * Detect explicit vs implicit facts
 */
export declare function isExplicit(content: string): boolean;
/**
 * Calculate content complexity (0-1)
 */
export declare function calculateComplexity(content: string): number;
/**
 * Normalize content for storage
 */
export declare function normalizeContent(content: string): string;
/**
 * Validate content before storage
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateContent(content: string, type: MemoryType): ValidationResult;
//# sourceMappingURL=fact-extractor.d.ts.map