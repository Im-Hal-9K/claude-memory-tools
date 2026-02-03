/**
 * Core type definitions for Memory MCP v2.0
 */
export type MemoryType = 'fact' | 'entity' | 'relationship' | 'self';
export interface Memory {
    id: string;
    content: string;
    summary: string;
    type: MemoryType;
    importance: number;
    created_at: number;
    last_accessed: number;
    access_count: number;
    expires_at: number | null;
    metadata: Record<string, unknown>;
    is_deleted: boolean;
}
export interface MemoryInput {
    id?: string;
    content: string;
    type: MemoryType;
    importance?: number;
    entities?: string[];
    tags?: string[];
    metadata?: Record<string, unknown>;
    ttl_days?: number | null;
    expires_at?: string;
    provenance?: ProvenanceInput;
}
export interface MemoryUpdate {
    id: string;
    content?: string;
    importance?: number;
    metadata?: Record<string, unknown>;
    ttl_days?: number | null;
    updateReason?: string;
}
export interface MemorySearchResult extends Memory {
    score: number;
    entities: Entity[];
    provenance: Provenance[];
}
export type EntityType = 'person' | 'organization' | 'project' | 'technology' | 'location' | 'concept' | 'document' | 'other';
export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    metadata: Record<string, unknown>;
    created_at: number;
}
export interface EntityInput {
    name: string;
    type?: EntityType;
    metadata?: Record<string, unknown>;
}
export type ProvenanceOperation = 'create' | 'update' | 'delete' | 'access' | 'restore';
export interface Provenance {
    id: string;
    memory_id: string;
    operation: ProvenanceOperation;
    timestamp: number;
    source: string;
    context: string | null;
    user_id: string | null;
    changes: Record<string, unknown> | null;
}
export interface ProvenanceInput {
    source: string;
    timestamp?: string;
    context?: string;
    user_id?: string;
}
export interface SearchOptions {
    query: string;
    max_tokens?: number;
    type?: MemoryType;
    entities?: string[];
    limit?: number;
}
export interface SearchOptionsInternal extends SearchOptions {
    offset?: number;
    minImportance?: number;
    includeExpired?: boolean;
}
export interface SearchFilters {
    type?: MemoryType;
    entities?: string[];
    minImportance?: number;
    includeExpired: boolean;
}
export interface ImportanceFactors {
    contentComplexity: number;
    entityCount: number;
    isUserPreference: boolean;
    hasProvenance: boolean;
    hasMetadata: boolean;
    isExplicit: boolean;
    typeBonus: number;
}
export interface TTLConfig {
    defaultDays: number;
    importanceMultiplier: number;
    accessBonusDays: number;
    refreshThresholdDays: number;
}
export type DetailLevel = 'minimal' | 'standard' | 'full';
/**
 * Minimal format: ~30 tokens - summaries only
 */
export interface MinimalMemory {
    id: string;
    type: string;
    summary: string;
    importance: number;
}
/**
 * Standard format: ~200 tokens - content + optional entities
 */
export interface StandardMemory {
    id: string;
    type: string;
    summary: string;
    content: string;
    entities?: string[];
    importance: number;
    created_at: string;
    last_accessed: string;
}
/**
 * Full format: ~500 tokens - everything + provenance
 */
export interface FullMemory {
    id: string;
    type: string;
    summary: string;
    content: string;
    entities: string[];
    tags: string[];
    importance: number;
    access_count: number;
    created_at: string;
    last_accessed: string;
    expires_at: string | null;
    provenance: {
        source: string;
        timestamp: string;
    } | null;
}
/**
 * Union type for all formatted memory formats
 */
export type FormattedMemory = MinimalMemory | StandardMemory | FullMemory;
export interface StoreResponse {
    success: boolean;
    memory_id: string;
    importance: number;
    entities_extracted: string[];
    expires_at: number | null;
    message: string;
}
export interface RecallResponse {
    index: MinimalMemory[];
    details: FormattedMemory[];
    total_count: number;
    has_more: boolean;
    tokens_used: number;
    query: string;
}
export interface UpdateResponse {
    success: boolean;
    memory_id: string;
    changes: Record<string, unknown>;
    message: string;
}
export interface ForgetResponse {
    success: boolean;
    memory_id: string;
    message: string;
}
export interface PruneResponse {
    success: boolean;
    pruned_count: number;
    dry_run: boolean;
    details: {
        expired_count: number;
        deleted_count: number;
        old_threshold_days: number;
    };
}
export declare class MemoryError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
}
export declare class DatabaseError extends MemoryError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends MemoryError {
    constructor(message: string, details?: Record<string, unknown>);
}
export interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}
export type Awaitable<T> = T | Promise<T>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export interface MemoryRow {
    id: string;
    content: string;
    summary: string;
    type: string;
    importance: number;
    created_at: number;
    last_accessed: number;
    access_count: number;
    expires_at: number | null;
    metadata: string;
    is_deleted: number;
}
export interface EntityRow {
    id: string;
    name: string;
    type: string;
    metadata: string;
    created_at: number;
}
export interface MemoryEntityRow {
    memory_id: string;
    entity_id: string;
    created_at: number;
}
export interface ProvenanceRow {
    id: string;
    memory_id: string;
    operation: string;
    timestamp: number;
    source: string;
    context: string | null;
    user_id: string | null;
    changes: string | null;
}
//# sourceMappingURL=index.d.ts.map