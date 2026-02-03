/**
 * Database connection management and utilities
 */
import type { DbDriver } from './db-driver.js';
import { type DatabaseStats } from './schema.js';
/**
 * Get or create database connection
 */
export declare function getDatabase(path: string): DbDriver;
/**
 * Close database connection
 */
export declare function closeDatabase(): void;
/**
 * Execute a transaction
 */
export declare function transaction<T>(db: DbDriver, fn: () => T): T;
/**
 * Serialize metadata to JSON string
 */
export declare function serializeMetadata(metadata: Record<string, unknown>): string;
/**
 * Deserialize metadata from JSON string
 */
export declare function deserializeMetadata(json: string): Record<string, unknown>;
/**
 * Generate unique ID
 */
export declare function generateId(prefix?: string): string;
/**
 * Get current timestamp in milliseconds
 */
export declare function now(): number;
/**
 * Prune expired and deleted memories
 */
export interface PruneResult {
    expired_count: number;
    deleted_count: number;
    total_pruned: number;
}
export declare function pruneMemories(db: DbDriver, olderThanDays?: number, dryRun?: boolean): PruneResult;
/**
 * Get database statistics
 */
export declare function getStats(db: DbDriver): DatabaseStats;
//# sourceMappingURL=connection.d.ts.map