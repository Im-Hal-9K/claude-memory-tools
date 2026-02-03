/**
 * Core type definitions for Memory MCP v2.0
 */
// ============================================================================
// Error Types
// ============================================================================
export class MemoryError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'MemoryError';
    }
}
export class DatabaseError extends MemoryError {
    constructor(message, details) {
        super(message, 'DATABASE_ERROR', details);
        this.name = 'DatabaseError';
    }
}
export class ValidationError extends MemoryError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=index.js.map