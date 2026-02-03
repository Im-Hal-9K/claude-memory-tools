/**
 * TTL (Time-To-Live) management for memories
 */
import type { TTLConfig } from '../types/index.js';
/**
 * Default TTL configuration
 */
export declare const DEFAULT_TTL_CONFIG: TTLConfig;
/**
 * Calculate TTL in days based on importance
 */
export declare function calculateTTLDays(importance: number, config?: TTLConfig): number | null;
/**
 * Calculate expiration timestamp
 */
export declare function calculateExpiresAt(ttlDays: number | null, importance: number, createdAt?: number): number | null;
/**
 * Check if memory should be refreshed on access
 */
export declare function shouldRefreshTTL(importance: number, lastAccessed: number, now?: number, config?: TTLConfig): boolean;
/**
 * Calculate new TTL on access (refresh)
 */
export declare function refreshTTL(originalTTLDays: number | null, importance: number, lastAccessed: number, now?: number, config?: TTLConfig): number | null;
/**
 * Check if memory is expired
 */
export declare function isExpired(expiresAt: number | null, now?: number): boolean;
/**
 * Calculate time until expiration
 */
export declare function getTimeUntilExpiration(expiresAt: number | null, now?: number): number | null;
//# sourceMappingURL=ttl-manager.d.ts.map