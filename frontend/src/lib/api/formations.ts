/**
 * API client for formations search
 * Handles formation catalog search with caching and error handling
 */

import axios, { AxiosError } from 'axios';
import type {
  FormationSearchRequest,
  FormationSearchResponse,
  FormationSearchError,
  FormationCacheEntry,
} from '@/types/formation';
import { formationSearchSchema } from '@/lib/validation/prospect-schema';

// API configuration
const FORMATIONS_API_URL = 'https://formialab.app.n8n.cloud/webhook/aed07f64-2937-44cc-80dd-1e7079ecc36a';
const CACHE_PREFIX = 'formations_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 5000; // 5 seconds

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Cache management utilities
 */
const cache = {
  /**
   * Get cached results for a query
   */
  get(query: string): FormationCacheEntry | null {
    try {
      const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (!cached) {
        return null;
      }

      const entry: FormationCacheEntry = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() > entry.expiresAt) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn('Failed to retrieve cache:', error);
      return null;
    }
  },

  /**
   * Store results in cache
   */
  set(query: string, results: FormationSearchResponse): void {
    try {
      const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}`;
      const entry: FormationCacheEntry = {
        query,
        results: results.formations,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL,
      };

      sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to store cache:', error);
    }
  },

  /**
   * Clear all formation cache
   */
  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};

/**
 * Search formations with caching and error handling
 */
export async function searchFormations(
  request: FormationSearchRequest
): Promise<FormationSearchResponse> {
  // Validate request parameters
  const validatedRequest = formationSearchSchema.parse(request);

  const { query, limit = 20 } = validatedRequest;

  // Check cache first
  const cachedResult = cache.get(query);
  if (cachedResult) {
    return {
      formations: cachedResult.results,
      total: cachedResult.results.length,
      hasMore: false,
    };
  }

  try {
    // Make API request
    const response = await apiClient.get<FormationSearchResponse>(FORMATIONS_API_URL, {
      params: {
        query,
        limit,
      },
    });

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.formations)) {
      throw new Error('Invalid response format from formations API');
    }

    const result = response.data;

    // Cache successful result
    cache.set(query, result);

    return result;
  } catch (error) {
    // Try to fall back to cache if available
    const fallbackCache = cache.get(query);
    if (fallbackCache) {
      console.warn('API failed, using cached results:', error);
      return {
        formations: fallbackCache.results,
        total: fallbackCache.results.length,
        hasMore: false,
      };
    }

    // Handle different error types
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<FormationSearchError>;

      if (axiosError.response?.status === 400) {
        throw new Error(
          axiosError.response.data?.message || 'Requête invalide'
        );
      }

      if (axiosError.response?.status === 500) {
        throw new Error('Erreur du serveur, veuillez réessayer plus tard');
      }

      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Délai d\'attente dépassé, veuillez réessayer');
      }

      if (!axiosError.response) {
        throw new Error('Impossible de contacter le service de formations');
      }
    }

    // Generic error fallback
    throw new Error('Erreur lors de la recherche de formations');
  }
}

/**
 * Clear formations cache
 */
export function clearFormationsCache(): void {
  cache.clear();
}

/**
 * Check if results are from cache
 */
export function isResultFromCache(query: string): boolean {
  return cache.get(query) !== null;
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus(): {
  entries: string[];
  totalSize: number;
} {
  try {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    let totalSize = 0;
    cacheKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    });

    return {
      entries: cacheKeys.map(key => key.replace(CACHE_PREFIX, '')),
      totalSize,
    };
  } catch (error) {
    return {
      entries: [],
      totalSize: 0,
    };
  }
}

/**
 * Preload popular formations (optional optimization)
 */
export async function preloadPopularFormations(): Promise<void> {
  const popularQueries = ['formation', 'react', 'javascript', 'typescript', 'python'];

  try {
    await Promise.allSettled(
      popularQueries.map(query =>
        searchFormations({ query, limit: 10 })
      )
    );
  } catch (error) {
    // Ignore preload errors
    console.debug('Preload failed:', error);
  }
}