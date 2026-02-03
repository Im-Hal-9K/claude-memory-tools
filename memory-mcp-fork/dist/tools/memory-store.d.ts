/**
 * Memory store tool - Store or update memories with auto-extraction
 * v2.0: Merged create + update functionality with summary generation
 */
import type { DbDriver } from '../database/db-driver.js';
import type { MemoryInput, StandardMemory } from '../types/index.js';
/**
 * Store or update a memory
 * If input.id is provided, updates existing memory
 * If input.id is not provided, creates new memory
 */
export declare function memoryStore(db: DbDriver, input: MemoryInput): StandardMemory;
//# sourceMappingURL=memory-store.d.ts.map