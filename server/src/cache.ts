/**
 * A tiny in-memory LRU cache with a time limit. Only for data that is the same
 * for everyone (dictionary lookups, suggestions): never put anything personal in it.
 */
export class TtlCache<V> {
  private map = new Map<string, { value: V; expires: number }>()
  constructor(
    private max: number,
    private ttlMs: number,
  ) {}

  get(key: string): V | undefined {
    const hit = this.map.get(key)
    if (!hit) return undefined
    if (hit.expires < Date.now()) {
      this.map.delete(key)
      return undefined
    }
    // Refresh recency: Map keeps insertion order, so re-insert.
    this.map.delete(key)
    this.map.set(key, hit)
    return hit.value
  }

  set(key: string, value: V) {
    this.map.delete(key)
    this.map.set(key, { value, expires: Date.now() + this.ttlMs })
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value as string)
  }
}
