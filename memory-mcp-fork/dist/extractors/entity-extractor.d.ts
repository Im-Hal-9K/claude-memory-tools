/**
 * Entity extraction with NER-like patterns
 */
import type { EntityType, EntityInput } from '../types/index.js';
/**
 * Extract named entities from content
 */
export declare function extractEntities(content: string): string[];
/**
 * Classify entity type
 */
export declare function classifyEntityType(name: string, context?: string): EntityType;
/**
 * Create entity input from name and context
 */
export declare function createEntityInput(name: string, context?: string): EntityInput;
/**
 * Normalize entity name
 */
export declare function normalizeEntityName(name: string): string;
/**
 * Deduplicate entities (handle variations)
 */
export declare function deduplicateEntities(entities: string[]): string[];
//# sourceMappingURL=entity-extractor.d.ts.map