# Redis Caching Layer

## Overview

FinanceHub now includes a **Redis caching layer** to optimize performance by reducing database queries for frequently accessed data.

### Current Cache Configuration

| Endpoint                        | Cache Key                    | TTL    | Purpose                               |
| ------------------------------- | ---------------------------- | ------ | ------------------------------------- |
| `GET /dashboard/overview`       | `dashboard:overview:*`       | 10 min | User income/expense summary           |
| `GET /dashboard/categories`     | `dashboard:categories:*`     | 10 min | Spending by category                  |
| `GET /dashboard/users`          | `dashboard:user:spending`    | 15 min | Per-user spending breakdown (analyst) |
| `GET /dashboard/trends/monthly` | `dashboard:trends:monthly:*` | 30 min | Historical monthly trends             |
| `GET /dashboard/trends/weekly`  | `dashboard:trends:weekly:*`  | 15 min | Historical weekly trends              |
| `GET /dashboard/recent`         | `dashboard:recent:*`         | 5 min  | Recent activity feed                  |

---

## Cache Invalidation

When a financial record is **created**, **updated**, or **deleted**, the following caches are automatically cleared:

```
dashboard:overview:*
dashboard:user:spending
dashboard:categories:*
dashboard:trends:*
dashboard:recent:*
records:list:*
```

This ensures dashboard analytics always show the latest data while maintaining performance.

---

## Architecture

### Files

- **`src/utils/cache.ts`** — Cache utility functions
  - `getCached()` — Retrieve from cache
  - `setCached()` — Store in cache with TTL
  - `deleteCached()` — Remove specific keys
  - `withCache()` — Wrapper for automatic cache management
  - `cacheKeys` — Centralized cache key generator
  - `invalidationPatterns` — Cache invalidation strategies

- **`src/config/redis.ts`** — Redis instance configuration
  - Uses `REDIS_URL` from `.env`
  - Default: `redis://127.0.0.1:6379`

- **`src/modules/dashboard/dashboard.service.ts`** — Caching applied to all analytics queries
- **`src/modules/records/record.service.ts`** — Cache invalidation on record changes

---

## Usage Example

```typescript
import { withCache, cacheKeys } from "../../utils/cache";

// Your expensive query
const result = await withCache(
  cacheKeys.overview("user-123"),
  () => fetchDataFromDatabase(),
  { ttl: 600 }, // 10 minutes
);
```

---

## Environment Setup

Ensure your `.env` has Redis configured:

```env
REDIS_URL=redis://127.0.0.1:6379
```

For **remote Redis** (e.g., AWS ElastiCache):

```env
REDIS_URL=redis://:password@endpoint:6379/0
```

---

## Monitoring

Check cache hits/misses via Redis CLI:

```bash
redis-cli
> INFO stats
```

---

## Next Steps

1. **Test the cache** — Make API calls and verify response times improve
2. **Monitor Redis** — Use `redis-cli MONITOR` to watch cache operations
3. **Adjust TTL values** — After 24+ hours of usage, tune TTL based on data freshness needs
4. **Consider caching records list** — For pagination, implement cache keys with filter parameters

---

## Troubleshooting

| Issue                        | Solution                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| No data showing after update | Cache invalidation may be slow; manually clear: `redis-cli FLUSHDB` |
| High Redis memory usage      | Reduce TTL values for less-accessed endpoints                       |
| Connection errors            | Verify Redis is running and `REDIS_URL` is correct                  |
