/**
 * Creates a debounced version of a function that delays invoking the function
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate If true, trigger the function on the leading edge instead of the trailing edge
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | NodeJS.Timeout | null = null
  
  return function(this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) {
      clearTimeout(timeout as NodeJS.Timeout)
    }
    
    timeout = setTimeout(later, wait)
    
    if (callNow) func.apply(this, args)
  }
}
