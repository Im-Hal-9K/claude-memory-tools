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
/**
 * Stub PreparedStatement for sql.js
 * All methods throw NotImplementedError
 */
class SqlJsStatementStub {
    sql;
    constructor(sql) {
        this.sql = sql;
    }
    run(..._params) {
        throw new Error(`SqlJsDriver.run() not implemented. SQL: ${this.sql}\n` +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.');
    }
    get(..._params) {
        throw new Error(`SqlJsDriver.get() not implemented. SQL: ${this.sql}\n` +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.');
    }
    all(..._params) {
        throw new Error(`SqlJsDriver.all() not implemented. SQL: ${this.sql}\n` +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.');
    }
    pluck() {
        throw new Error(`SqlJsDriver.pluck() not implemented. SQL: ${this.sql}\n` +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.');
    }
}
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
export class SqlJsDriver {
    /**
     * Placeholder constructor
     * Real implementation would accept sql.js Database instance
     */
    constructor() {
        // When implementing, accept sql.js Database instance as parameter
    }
    prepare(sql) {
        // Stub: return throwing statement wrapper
        return new SqlJsStatementStub(sql);
    }
    exec(_sql) {
        throw new Error('SqlJsDriver.exec() not implemented.\n' +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.\n' +
            'sql.js supports exec() for multi-statement SQL.');
    }
    pragma(_pragma) {
        throw new Error('SqlJsDriver.pragma() not implemented.\n' +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.\n' +
            'sql.js supports PRAGMA statements via exec() or run().');
    }
    transaction(_fn) {
        throw new Error('SqlJsDriver.transaction() not implemented.\n' +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.\n' +
            'sql.js transactions can be implemented using BEGIN/COMMIT/ROLLBACK statements.');
    }
    close() {
        throw new Error('SqlJsDriver.close() not implemented.\n' +
            'To use sql.js driver, implement SqlJsDriver according to sql.js API documentation.\n' +
            'sql.js Database has a close() method to free memory.');
    }
}
/**
 * Stub factory function for SqlJsDriver
 *
 * @throws Error - Always throws, as sql.js is not implemented
 */
export function createSqlJsDriver() {
    throw new Error('createSqlJsDriver() not implemented.\n' +
        'To use sql.js driver:\n' +
        '1. Install: npm install sql.js\n' +
        '2. Initialize: const SQL = await initSqlJs()\n' +
        '3. Create DB: const db = new SQL.Database()\n' +
        '4. Wrap in SqlJsDriver: return new SqlJsDriver(db)\n\n' +
        'sql.js is useful for:\n' +
        '- Browser environments\n' +
        '- Serverless functions\n' +
        '- In-memory testing\n\n' +
        'For now, use MEMORY_DB_DRIVER=better-sqlite3 (default)');
}
//# sourceMappingURL=sqljs-driver.js.map