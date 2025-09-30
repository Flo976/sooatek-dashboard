/**
 * TypeScript interface definitions for Formation entities
 * Based on data-model.md specifications
 */

/**
 * Training program available for selection
 */
export interface Formation {
  /** Unique identifier */
  id: string;
  /** Formation name/title */
  nom: string;
  /** Optional description */
  description?: string;
  /** Optional category */
  categorie?: string;
  /** Standard duration in hours */
  dureeStandard?: number;
}

/**
 * API response structure for formation search
 */
export interface FormationSearchResponse {
  /** Array of matching formations */
  formations: Formation[];
  /** Total count */
  total: number;
  /** Pagination indicator */
  hasMore: boolean;
}

/**
 * Request parameters for formation search
 */
export interface FormationSearchRequest {
  /** Search term (minimum 2 characters) */
  query: string;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Formation search error response
 */
export interface FormationSearchError {
  /** Error message */
  message: string;
  /** Error code for debugging */
  code?: string;
}

/**
 * Formation cache entry structure
 */
export interface FormationCacheEntry {
  /** Search query that generated this cache */
  query: string;
  /** Cached formation results */
  results: Formation[];
  /** Cache creation timestamp */
  timestamp: number;
  /** Cache expiration timestamp */
  expiresAt: number;
}

/**
 * Formation search state for managing component behavior
 */
export interface FormationSearchState {
  /** Current search query */
  query: string;
  /** Search results */
  results: Formation[];
  /** Whether search is in progress */
  isLoading: boolean;
  /** Whether dropdown is open */
  isOpen: boolean;
  /** Current error state */
  error?: string;
  /** Selected formation */
  selectedFormation?: Formation;
  /** Whether results came from cache */
  isCached: boolean;
}

/**
 * Formation dropdown option for UI components
 */
export interface FormationOption {
  /** Option value (formation ID) */
  value: string;
  /** Option label (formation name) */
  label: string;
  /** Full formation data */
  formation: Formation;
}

/**
 * Configuration for formation search behavior
 */
export interface FormationSearchConfig {
  /** Minimum characters required to trigger search */
  minQueryLength: number;
  /** Debounce delay in milliseconds */
  debounceMs: number;
  /** Maximum number of results to display */
  maxResults: number;
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Whether to enable caching */
  enableCache: boolean;
}

/**
 * Default configuration for formation search
 */
export const DEFAULT_FORMATION_SEARCH_CONFIG: FormationSearchConfig = {
  minQueryLength: 2,
  debounceMs: 300,
  maxResults: 20,
  cacheTTL: 300000, // 5 minutes
  enableCache: true,
};

/**
 * Formation search result with metadata
 */
export interface FormationSearchResult {
  /** The formations found */
  formations: Formation[];
  /** Whether results came from cache */
  fromCache: boolean;
  /** Query that generated these results */
  query: string;
  /** Total available results */
  total: number;
  /** Whether more results are available */
  hasMore: boolean;
}

/**
 * Hook return type for useFormationSearch
 */
export interface UseFormationSearchReturn {
  /** Current search state */
  state: FormationSearchState;
  /** Search function */
  search: (query: string) => Promise<void>;
  /** Clear search results */
  clear: () => void;
  /** Select a formation */
  selectFormation: (formation: Formation) => void;
  /** Clear selection */
  clearSelection: () => void;
}