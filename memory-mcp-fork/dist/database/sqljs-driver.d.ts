/**
 * SqlJsDriver - Stub adapter for sql.js (NOT YET FUNCTIONAL)
 *
 * This is a placeholder implementation to demonstrate the pluggable driver architecture.
 * sql.js is an in-memory SQLite implementation compiled to WebAssembly, useful for:
 * - Browser environments
 * - Serverless functions with ephemeral filesystems
 * - Testing with isolated in-memory databases
 *
 * TODO: Implement actual sql.js integration when needed
 * - Install sql.js: npm install sql.js
 * - Handle async initialization (sql.js Database constructor is async)
 * - Map sql.js Statement API to PreparedStatement interface
 * - Handle parameter binding differences
 * - Implement transaction support
 */
import type { DbDriver, PreparedStatement } from './db-driver.js';
/**
 * Stub adapter for sql.js Database
 * All methods throw NotImplementedError
 *
 * When implementing:
 * 1. Install sql.js: npm install sql.js
 * 2. Import: import initSqlJs from 'sql.js'
 * 3. Initialize async: const SQL = await initSqlJs()
 * 4. Create database: const db = new SQL.Database()
 * 5. Wrap sql.js Statement API to match PreparedStatement interface
 * 6. Handle exec() for multi-statement SQL
 * 7. Implement pragma() using PRAGMA statements
 * 8. Wrap transactions (sql.js doesn't have explicit transaction API)
 */
export declare class SqlJsDriver implements DbDriver {
    /**
     * Placeholder constructor
     * Real implementation would accept sql.js Database instance
     */
    constructor();
    prepare<T = unknown>(sql: string): PreparedStatement<T>;
    exec(_sql: string): void;
    pragma(_pragma: string): unknown;
    transaction<T>(_fn: () => T): () => T;
    close(): void;
}
/**
 * Stub factory function for SqlJsDriver
 *
 * @throws Error - Always throws, as sql.js is not implemented
 */
export declare function createSqlJsDriver(): SqlJsDriver;
//# sourceMappingURL=sqljs-driver.d.ts.map