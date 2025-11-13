export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred. Please try again.'
}

export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]`, error)
  }

  // In production, you might want to send errors to a logging service
  // Example: sendToLoggingService(error, context)
}
