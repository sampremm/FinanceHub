import { redis } from "../config/redis";



export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 5 minutes)
}

/**
 * Get value from cache
 */
export const getCached = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`❌ Cache GET error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in cache with optional TTL
 */
export const setCached = async <T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> => {
  try {
    const ttl = options.ttl || 300; // default 5 minutes
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ Cache SET error for key ${key}:`, error);
  }
};

/**
 * Delete cache key(s)
 */
export const deleteCached = async (keys: string | string[]): Promise<void> => {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    if (keyArray.length > 0) {
      await redis.del(...keyArray);
    }
  } catch (error) {
    console.error(`❌ Cache DELETE error:`, error);
  }
};

/**
 * Delete multiple cache keys by pattern
 */
export const deleteCachedByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`❌ Cache DELETE pattern error:`, error);
  }
};

/**
 * Cache key generators for different data types
 */
export const cacheKeys = {
  // Dashboard
  overview: (userId?: string) =>
    userId ? `dashboard:overview:${userId}` : "dashboard:overview:global",
  
  userSpending: "dashboard:user:spending",
  
  categories: (userId?: string) =>
    userId ? `dashboard:categories:${userId}` : "dashboard:categories:global",
  
  monthlyTrends: (months: number, userId?: string) =>
    userId
      ? `dashboard:trends:monthly:${months}:${userId}`
      : `dashboard:trends:monthly:${months}`,
  
  weeklyTrends: (userId?: string) =>
    userId ? `dashboard:trends:weekly:${userId}` : "dashboard:trends:weekly",
  
  recentActivity: (userId?: string) =>
    userId ? `dashboard:recent:${userId}` : "dashboard:recent:global",

  // Records
  recordsList: (filters: any) =>
    `records:list:${JSON.stringify(filters)}`,

  // Users
  usersList: "users:list",
  userById: (userId: string) => `users:${userId}`,

  // Auth
  userByEmail: (email: string) => `user:email:${email}`,
};

/**
 * Invalidation patterns
 */
export const invalidationPatterns = {
  // When a record is created/updated/deleted
  onRecordChange: async (userId: string) => {
    const patterns = [
      "dashboard:overview:*",
      "dashboard:user:spending",
      "dashboard:categories:*",
      "dashboard:trends:*",
      "dashboard:recent:*",
      "records:list:*",
    ];
    for (const pattern of patterns) {
      await deleteCachedByPattern(pattern);
    }
  },

  // When a user is updated
  onUserChange: async (userId: string) => {
    await deleteCached([
      cacheKeys.userById(userId),
      "users:list",
      cacheKeys.userSpending,
    ]);
  },

  // Clear all dashboard cache
  clearDashboard: async () => {
    await deleteCachedByPattern("dashboard:*");
  },
};

/**
 * Wrap an async function with caching
 */
export const withCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  // Try to get from cache
  const cached = await getCached<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const data = await fetchFn();
  await setCached(cacheKey, data, options);
  return data;
};
