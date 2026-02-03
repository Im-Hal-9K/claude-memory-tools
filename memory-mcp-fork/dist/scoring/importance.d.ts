/**
 * Importance scoring system for memories
 */
import type { ImportanceFactors, MemoryType } from '../types/index.js';
/**
 * Calculate importance score automatically (0-10)
 */
export declare function calculateImportance(content: string, type: MemoryType, entities: string[], metadata: Record<string, unknown>, hasProvenance: boolean): number;
/**
 * Analyze factors that contribute to importance
 */
export declare function analyzeImportanceFactors(content: string, type: MemoryType, entities: string[], metadata: Record<string, unknown>, hasProvenance: boolean): ImportanceFactors;
/**
 * Calculate importance from analyzed factors
 */
export declare function calculateImportanceFromFactors(factors: ImportanceFactors): number;
/**
 * Adjust importance based on context signals
 */
export declare function adjustImportanceForContext(baseImportance: number, signals: {
    isSecuritySensitive?: boolean;
    isUserIdentity?: boolean;
    isProjectRequirement?: boolean;
    isDeprecated?: boolean;
    userExplicitlyMarked?: boolean;
}): number;
/**
 * Get recommended TTL for importance level
 */
export declare function getRecommendedTTL(importance: number): number | null;
/**
 * Calculate effective importance (with decay over time)
 */
export declare function calculateEffectiveImportance(baseImportance: number, lastAccessed: number, now: number): number;
/**
 * Boost importance on repeated access
 */
export declare function boostImportanceOnAccess(currentImportance: number, accessCount: number, daysSinceCreated: number): number;
//# sourceMappingURL=importance.d.ts.map