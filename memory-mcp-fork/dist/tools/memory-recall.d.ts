/**
 * Memory recall tool - Token-aware semantic search
 * v3.0: Dual-response pattern (index + details) for skill-like progressive loading
 */
import type { DbDriver } from '../database/db-driver.js';
import type { SearchOptions, RecallResponse } from '../types/index.js';
/**
 * Recall memories using semantic search with intelligent token budgeting
 * Returns: index (all matches as summaries) + details (top matches with full content)
 */
export declare function memoryRecall(db: DbDriver, options: SearchOptions): RecallResponse;
//# sourceMappingURL=memory-recall.d.ts.map