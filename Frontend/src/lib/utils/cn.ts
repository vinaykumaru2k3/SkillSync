/**
 * Utility function to merge class names
 * Similar to clsx/classnames but minimal implementation
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
