/**
 * BetterSqlite3Driver - Adapter for better-sqlite3
 *
 * Wraps better-sqlite3's Database to implement the DbDriver interface.
 * This adapter allows the codebase to depend on the interface rather than
 * the concrete better-sqlite3 types, enabling future database driver swaps.
 */
import Database from 'better-sqlite3';
import type { DbDriver, PreparedStatement } from './db-driver.js';
/**
 * Adapter for better-sqlite3 Database
 * Implements DbDriver interface
 */
export declare class BetterSqlite3Driver implements DbDriver {
    private db;
    constructor(db: Database.Database);
    prepare<T = unknown>(sql: string): PreparedStatement<T>;
    exec(sql: string): void;
    pragma(pragma: string): unknown;
    transaction<T>(fn: () => T): () => T;
    close(): void;
    /**
     * Get the underlying better-sqlite3 Database instance
     * Only exposed for migration purposes - avoid using in business logic
     *
     * @internal
     */
    getUnderlying(): Database.Database;
}
/**
 * Create a BetterSqlite3Driver from a file path
 *
 * @param path Database file path
 * @param options better-sqlite3 options
 * @returns Driver instance
 */
export declare function createBetterSqlite3Driver(path: string, options?: Database.Options): BetterSqlite3Driver;
//# sourceMappingURL=better-sqlite3-driver.d.ts.map