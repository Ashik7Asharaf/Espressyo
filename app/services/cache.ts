interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  private stats: CacheStats;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      entries: 0,
    };
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, item);
    this.updateStats();
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    this.updateStats();
  }

  public clear(): void {
    this.cache.clear();
    this.updateStats();
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getSize(): number {
    return this.stats.size;
  }

  public getEntryCount(): number {
    return this.stats.entries;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private updateStats(): void {
    this.stats.entries = this.cache.size;
    this.stats.size = JSON.stringify(this.cache).length;
  }

  // Cache with automatic cleanup
  public setWithCleanup<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.set(key, data, ttl);
    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  // Cache with refresh
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }

  // Cache with batch operations
  public setMany<T>(items: Array<{ key: string; data: T; ttl?: number }>): void {
    items.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  public getMany<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach(key => {
      result.set(key, this.get<T>(key));
    });
    return result;
  }

  // Cache with tags
  private tagMap: Map<string, Set<string>> = new Map();

  public setWithTag<T>(key: string, data: T, tag: string, ttl: number = this.DEFAULT_TTL): void {
    this.set(key, data, ttl);
    if (!this.tagMap.has(tag)) {
      this.tagMap.set(tag, new Set());
    }
    this.tagMap.get(tag)?.add(key);
  }

  public invalidateByTag(tag: string): void {
    const keys = this.tagMap.get(tag);
    if (keys) {
      keys.forEach(key => this.delete(key));
      this.tagMap.delete(tag);
    }
  }

  // Cache with size limits
  private readonly MAX_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_ENTRIES = 10000;

  private checkSizeLimits(): void {
    if (this.stats.size > this.MAX_SIZE || this.stats.entries > this.MAX_ENTRIES) {
      this.cleanup();
    }
  }

  public setWithSizeCheck<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.set(key, data, ttl);
    this.checkSizeLimits();
  }
}

export const cache = CacheService.getInstance(); 