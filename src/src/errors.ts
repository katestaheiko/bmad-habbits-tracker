// Custom error class for user-facing errors (exit code 1)
// vs unexpected DB errors (exit code 2)

export type ErrorCode = 'DUPLICATE' | 'NOT_FOUND' | 'INVALID_NAME' | 'DB_ERROR'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
