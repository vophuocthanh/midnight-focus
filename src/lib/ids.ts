/** Works outside secure contexts, where crypto.randomUUID is unavailable. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
