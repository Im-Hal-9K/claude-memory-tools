/**
 * Database schema definitions and migrations for Memory MCP
 */
import type { DbDriver } from './db-driver.js';
export declare const SCHEMA_VERSION = 3;
/**
 * Initialize database schema
 */
export declare function initializeSchema(db: DbDriver): void;
/**
 * Create optimized views for common queries
 */
export declare function createViews(db: DbDriver): void;
/**
 * Optimize database for performance
 */
export declare function optimizeDatabase(db: DbDriver): void;
/**
 * Get database statistics
 */
export interface DatabaseStats {
    total_memories: number;
    active_memories: number;
    deleted_memories: number;
    expired_memories: number;
    total_entities: number;
    total_provenance_records: number;
    database_size_bytes: number;
    memory_avg_importance: number;
    oldest_memory_age_days: number;
}
export declare function getDatabaseStats(db: DbDriver): DatabaseStats;
//# sourceMappingURL=schema.d.ts.map