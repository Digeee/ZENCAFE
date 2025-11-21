// Auth utilities
export function isUnauthorizedError(error: any): boolean {
  return error?.response?.status === 401 || error?.response?.status === 403;
}