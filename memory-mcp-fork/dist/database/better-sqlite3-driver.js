/**
 * BetterSqlite3Driver - Adapter for better-sqlite3
 *
 * Wraps better-sqlite3's Database to implement the DbDriver interface.
 * This adapter allows the codebase to depend on the interface rather than
 * the concrete better-sqlite3 types, enabling future database driver swaps.
 */
import Database from 'better-sqlite3';
/**
 * Wrapper for better-sqlite3's Statement
 * Implements PreparedStatement interface
 */
class StatementWrapper {
    stmt;
    constructor(stmt) {
        this.stmt = stmt;
    }
    run(...params) {
        const result = this.stmt.run(...params);
        return {
            changes: result.changes,
        };
    }
    get(...params) {
        return this.stmt.get(...params);
    }
    all(...params) {
        return this.stmt.all(...params);
    }
    pluck() {
        // better-sqlite3's pluck() returns a modified Statement
        const pluckedStmt = this.stmt.pluck();
        return new StatementWrapper(pluckedStmt);
    }
}
/**
 * Adapter for better-sqlite3 Database
 * Implements DbDriver interface
 */
export class BetterSqlite3Driver {
    db;
    constructor(db) {
        this.db = db;
    }
    prepare(sql) {
        const stmt = this.db.prepare(sql);
        return new StatementWrapper(stmt);
    }
    exec(sql) {
        this.db.exec(sql);
    }
    pragma(pragma) {
        return this.db.pragma(pragma);
    }
    transaction(fn) {
        return this.db.transaction(fn);
    }
    close() {
        this.db.close();
    }
    /**
     * Get the underlying better-sqlite3 Database instance
     * Only exposed for migration purposes - avoid using in business logic
     *
     * @internal
     */
    getUnderlying() {
        return this.db;
    }
}
/**
 * Create a BetterSqlite3Driver from a file path
 *
 * @param path Database file path
 * @param options better-sqlite3 options
 * @returns Driver instance
 */
export function createBetterSqlite3Driver(path, options) {
    const db = new Database(path, options);
    return new BetterSqlite3Driver(db);
}
//# sourceMappingURL=better-sqlite3-driver.js.map