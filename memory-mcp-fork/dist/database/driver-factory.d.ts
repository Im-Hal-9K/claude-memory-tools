/**
 * Driver Factory - Selects database driver based on environment configuration
 *
 * Supports pluggable database drivers through the DbDriver interface.
 * Selection is controlled by MEMORY_DB_DRIVER environment variable.
 */
import type { DbDriver } from './db-driver.js';
import type Database from 'better-sqlite3';
/**
 * Supported database driver types
 */
export type DriverType = 'better-sqlite3' | 'sqljs';
/**
 * Driver configuration options
 */
export interface DriverConfig {
    /**
     * Database file path (for file-based drivers like better-sqlite3)
     */
    path: string;
    /**
     * Driver-specific options (e.g., better-sqlite3 Database.Options)
     */
    options?: Database.Options;
}
/**
 * Create database driver based on type
 *
 * @param type - Driver type ('better-sqlite3' or 'sqljs')
 * @param config - Driver configuration
 * @returns DbDriver instance
 * @throws Error if driver type is unsupported or driver initialization fails
 */
export declare function createDriver(type: DriverType, config: DriverConfig): DbDriver;
/**
 * Get driver type from environment variable
 *
 * @returns Driver type from MEMORY_DB_DRIVER env var, defaults to 'better-sqlite3'
 */
export declare function getDriverTypeFromEnv(): DriverType;
/**
 * Create database driver from environment configuration
 *
 * Convenience function that reads MEMORY_DB_DRIVER from environment
 * and creates the appropriate driver instance.
 *
 * @param config - Driver configuration
 * @returns DbDriver instance
 */
export declare function createDriverFromEnv(config: DriverConfig): DbDriver;
//# sourceMappingURL=driver-factory.d.ts.map