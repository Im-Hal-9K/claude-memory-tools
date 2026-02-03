/**
 * TTL (Time-To-Live) management for memories
 */
import { getRecommendedTTL } from './importance.js';
/**
 * Default TTL configuration
 */
export const DEFAULT_TTL_CONFIG = {
    defaultDays: 90,
    importanceMultiplier: 0.7, // Multiply base TTL by this factor based on importance
    accessBonusDays: 30, // Bonus days added on access for important memories
    refreshThresholdDays: 7, // Minimum days since last access before refresh
};
/**
 * Calculate TTL in days based on importance
 */
export function calculateTTLDays(importance, config = DEFAULT_TTL_CONFIG) {
    // Use recommended TTL from importance tier
    const recommended = getRecommendedTTL(importance);
    if (recommended === null) {
        return null; // Permanent
    }
    // Apply importance multiplier to base TTL
    const importanceFactor = (importance / 10) * config.importanceMultiplier;
    const adjusted = Math.round(recommended * (1 + importanceFactor));
    return Math.max(1, adjusted);
}
/**
 * Calculate expiration timestamp
 */
export function calculateExpiresAt(ttlDays, importance, createdAt = Date.now()) {
    if (ttlDays === null) {
        return null; // Permanent memory
    }
    const baseTTL = ttlDays * 24 * 60 * 60 * 1000;
    // Add importance bonus (up to 7 extra days for importance 10)
    const importanceBonus = (importance / 10) * 7 * 24 * 60 * 60 * 1000;
    return createdAt + baseTTL + importanceBonus;
}
/**
 * Check if memory should be refreshed on access
 */
export function shouldRefreshTTL(importance, lastAccessed, now = Date.now(), config = DEFAULT_TTL_CONFIG) {
    const daysSinceAccess = (now - lastAccessed) / (1000 * 60 * 60 * 24);
    // Important memories (>=6): refresh if accessed after 7+ days
    if (importance >= 6 && daysSinceAccess > config.refreshThresholdDays) {
        return true;
    }
    // Moderately important (4-5): refresh if accessed after 30+ days
    if (importance >= 4 && daysSinceAccess > 30) {
        return true;
    }
    // Low importance (1-3): don't refresh, let it expire
    return false;
}
/**
 * Calculate new TTL on access (refresh)
 */
export function refreshTTL(originalTTLDays, importance, lastAccessed, now = Date.now(), config = DEFAULT_TTL_CONFIG) {
    if (originalTTLDays === null) {
        return null; // Permanent memory, no refresh needed
    }
    if (!shouldRefreshTTL(importance, lastAccessed, now, config)) {
        return null; // No refresh
    }
    // Calculate access bonus
    const accessBonus = (importance / 10) * config.accessBonusDays * 24 * 60 * 60 * 1000;
    // Base TTL + access bonus
    const baseTTL = originalTTLDays * 24 * 60 * 60 * 1000;
    if (importance >= 6) {
        // Important memories: full refresh + bonus
        return now + baseTTL + accessBonus;
    }
    else if (importance >= 4) {
        // Moderately important: refresh + half bonus
        return now + baseTTL + accessBonus / 2;
    }
    return null;
}
/**
 * Check if memory is expired
 */
export function isExpired(expiresAt, now = Date.now()) {
    if (expiresAt === null) {
        return false; // Permanent memory never expires
    }
    return expiresAt <= now;
}
/**
 * Calculate time until expiration
 */
export function getTimeUntilExpiration(expiresAt, now = Date.now()) {
    if (expiresAt === null) {
        return null; // Permanent memory
    }
    const timeLeft = expiresAt - now;
    return Math.max(0, timeLeft);
}
//# sourceMappingURL=ttl-manager.js.map