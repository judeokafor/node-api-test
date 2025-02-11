/**
 * Base pagination metadata
 */
export interface IPaginationMeta {
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Paginated response with metadata
 */
export interface IPaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Pagination metadata */
  meta: IPaginationMeta;
}
