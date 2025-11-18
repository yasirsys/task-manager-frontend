export interface Pagination {
  skip: number; // Number of items to skip (offset)
  total: number; // Total number of items
  totalPages: number; // Total number of pages
  page: number; // Current page number
  limit: number; // Number of items per page
}
