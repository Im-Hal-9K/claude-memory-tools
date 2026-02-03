/**
 * Memory forget tool - Soft delete memories
 */
import type { DbDriver } from '../database/db-driver.js';
import type { ForgetResponse } from '../types/index.js';
/**
 * Forget (soft delete) a memory
 */
export declare function memoryForget(db: DbDriver, id: string, reason?: string): ForgetResponse;
//# sourceMappingURL=memory-forget.d.ts.map