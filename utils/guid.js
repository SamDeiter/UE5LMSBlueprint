/* global crypto */
// GUID generation utility
// Uses crypto.randomUUID if available, otherwise falls back to a simple random string.
export function generateGUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback: generate a UUID v4-like string
    const hex = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`;
}
