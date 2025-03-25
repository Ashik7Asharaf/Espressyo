interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests per window
  message?: string;  // Custom error message
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  total: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitConfig>;
  private requests: Map<string, number[]>;
  private readonly DEFAULT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly DEFAULT_MAX_REQUESTS = 100;

  private constructor() {
    this.limits = new Map();
    this.requests = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public setLimit(key: string, config: Partial<RateLimitConfig>): void {
    this.limits.set(key, {
      windowMs: config.windowMs || this.DEFAULT_WINDOW,
      maxRequests: config.maxRequests || this.DEFAULT_MAX_REQUESTS,
      message: config.message || 'Too many requests, please try again later.',
    });
  }

  public isRateLimited(key: string): boolean {
    const config = this.limits.get(key) || {
      windowMs: this.DEFAULT_WINDOW,
      maxRequests: this.DEFAULT_MAX_REQUESTS,
    };

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing requests or initialize new array
    let requests = this.requests.get(key) || [];
    
    // Remove old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (requests.length >= config.maxRequests) {
      return true;
    }

    // Add new request
    requests.push(now);
    this.requests.set(key, requests);

    return false;
  }

  public getRateLimitInfo(key: string): RateLimitInfo {
    const config = this.limits.get(key) || {
      windowMs: this.DEFAULT_WINDOW,
      maxRequests: this.DEFAULT_MAX_REQUESTS,
    };

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);

    return {
      remaining: Math.max(0, config.maxRequests - recentRequests.length),
      reset: windowStart + config.windowMs,
      total: config.maxRequests,
    };
  }

  public clear(key: string): void {
    this.requests.delete(key);
  }

  public clearAll(): void {
    this.requests.clear();
  }

  // Rate limiting with custom keys
  public isRateLimitedByKey(key: string, customKey: string): boolean {
    const fullKey = `${key}:${customKey}`;
    return this.isRateLimited(fullKey);
  }

  // Rate limiting with IP addresses
  public isRateLimitedByIP(ip: string): boolean {
    return this.isRateLimited(`ip:${ip}`);
  }

  // Rate limiting with user IDs
  public isRateLimitedByUser(userId: string): boolean {
    return this.isRateLimited(`user:${userId}`);
  }

  // Rate limiting with endpoints
  public isRateLimitedByEndpoint(endpoint: string): boolean {
    return this.isRateLimited(`endpoint:${endpoint}`);
  }

  // Rate limiting with custom time windows
  public isRateLimitedWithWindow(
    key: string,
    windowMs: number,
    maxRequests: number
  ): boolean {
    const config: RateLimitConfig = {
      windowMs,
      maxRequests,
    };

    this.setLimit(key, config);
    return this.isRateLimited(key);
  }

  // Rate limiting with burst protection
  public isRateLimitedWithBurst(
    key: string,
    windowMs: number,
    maxRequests: number,
    burstSize: number
  ): boolean {
    const config: RateLimitConfig = {
      windowMs,
      maxRequests: maxRequests + burstSize,
    };

    this.setLimit(key, config);
    return this.isRateLimited(key);
  }

  // Rate limiting with sliding window
  public isRateLimitedWithSlidingWindow(
    key: string,
    windowMs: number,
    maxRequests: number
  ): boolean {
    const now = Date.now();
    const config: RateLimitConfig = {
      windowMs,
      maxRequests,
    };

    this.setLimit(key, config);
    const requests = this.requests.get(key) || [];
    const windowStart = now - windowMs;
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return true;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return false;
  }

  // Rate limiting with token bucket
  public isRateLimitedWithTokenBucket(
    key: string,
    tokensPerSecond: number,
    bucketSize: number
  ): boolean {
    const now = Date.now();
    const config: RateLimitConfig = {
      windowMs: 1000, // 1 second
      maxRequests: bucketSize,
    };

    this.setLimit(key, config);
    const requests = this.requests.get(key) || [];
    const lastRefill = requests[requests.length - 1] || now;
    const timePassed = now - lastRefill;
    const tokensToAdd = Math.floor(timePassed * tokensPerSecond / 1000);

    if (tokensToAdd > 0) {
      requests.length = Math.min(requests.length + tokensToAdd, bucketSize);
      requests[requests.length - 1] = now;
      this.requests.set(key, requests);
    }

    return requests.length >= bucketSize;
  }
}

export const rateLimiter = RateLimiter.getInstance(); 