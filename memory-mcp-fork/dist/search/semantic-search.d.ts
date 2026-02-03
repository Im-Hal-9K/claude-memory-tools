/**
 * Full-text search implementation using SQLite FTS5
 * Replaces vector embeddings with lightweight keyword/phrase matching
 */
import type { DbDriver } from '../database/db-driver.js';
import type { MemorySearchResult, SearchOptionsInternal } from '../types/index.js';
/**
 * Perform full-text search on memories using FTS5
 * Returns: { results: MemorySearchResult[], totalCount: number }
 */
export declare function semanticSearch(db: DbDriver, options: SearchOptionsInternal): {
    results: MemorySearchResult[];
    totalCount: number;
};
//# sourceMappingURL=semantic-search.d.ts.map