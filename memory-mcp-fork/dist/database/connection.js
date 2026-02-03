/**
 * Database connection management and utilities
 */
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { createDriverFromEnv } from './driver-factory.js';
import { initializeSchema, createViews, optimizeDatabase, getDatabaseStats, } from './schema.js';
import { DatabaseError } from '../types/index.js';
let dbInstance = null;
/**
 * Get or create database connection
 */
export function getDatabase(path) {
    if (dbInstance) {
        return dbInstance;
    }
    try {
        // Ensure directory exists
        const dir = dirname(path);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        // Open database using driver factory (respects MEMORY_DB_DRIVER env var)
        dbInstance = createDriverFromEnv({
            path,
            options: {
                verbose: process.env['NODE_ENV'] === 'development' ? () => { } : undefined,
            },
        });
        // Initialize schema
        initializeSchema(dbInstance);
        // Create views
        createViews(dbInstance);
        // Optimize
        optimizeDatabase(dbInstance);
        return dbInstance;
    }
    catch (error) {
        throw new DatabaseError('Failed to initialize database', {
            path,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
/**
 * Close database connection
 */
export function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
/**
 * Execute a transaction
 */
export function transaction(db, fn) {
    const txn = db.transaction(fn);
    return txn();
}
/**
 * Serialize metadata to JSON string
 */
export function serializeMetadata(metadata) {
    return JSON.stringify(metadata);
}
/**
 * Deserialize metadata from JSON string
 */
export function deserializeMetadata(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return {};
    }
}
/**
 * Generate unique ID
 */
export function generateId(prefix = 'mem') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}${random}`;
}
/**
 * Get current timestamp in milliseconds
 */
export function now() {
    return Date.now();
}
export function pruneMemories(db, olderThanDays = 0, dryRun = false) {
    const threshold = now() - olderThanDays * 24 * 60 * 60 * 1000;
    // Count expired memories
    const expiredCount = db
        .prepare(`
    SELECT COUNT(*) FROM memories
    WHERE is_deleted = 0
      AND expires_at IS NOT NULL
      AND expires_at <= ?
  `)
        .pluck()
        .get(threshold);
    // Count soft-deleted memories
    const deletedCount = db
        .prepare(`
    SELECT COUNT(*) FROM memories
    WHERE is_deleted = 1
      AND created_at <= ?
  `)
        .pluck()
        .get(threshold);
    if (dryRun) {
        return {
            expired_count: expiredCount,
            deleted_count: deletedCount,
            total_pruned: 0,
        };
    }
    // Permanently delete expired memories
    const expiredDeleted = db
        .prepare(`
    DELETE FROM memories
    WHERE is_deleted = 0
      AND expires_at IS NOT NULL
      AND expires_at <= ?
  `)
        .run(threshold);
    // Permanently delete soft-deleted memories
    const softDeleted = db
        .prepare(`
    DELETE FROM memories
    WHERE is_deleted = 1
      AND created_at <= ?
  `)
        .run(threshold);
    // Clean up orphaned entities (not linked to any memory)
    db.prepare(`
    DELETE FROM entities
    WHERE id NOT IN (SELECT DISTINCT entity_id FROM memory_entities)
  `).run();
    return {
        expired_count: expiredCount,
        deleted_count: deletedCount,
        total_pruned: expiredDeleted.changes + softDeleted.changes,
    };
}
/**
 * Get database statistics
 */
export function getStats(db) {
    return getDatabaseStats(db);
}
//# sourceMappingURL=connection.js.map