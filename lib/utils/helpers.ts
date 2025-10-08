/**
 * Generate a unique section ID
 */
export function generateSectionId(prefix: string = 'section'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is currently focused
 */
export function isElementFocused(element: HTMLElement | null): boolean {
  return element !== null && document.activeElement === element;
}

/**
 * Safely focus an element
 */
export function focusElement(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

/**
 * Safely blur an element
 */
export function blurElement(element: HTMLElement | null): void {
  if (element && typeof element.blur === 'function') {
    element.blur();
  }
}

/**
 * Add a class to an element
 */
export function addClass(element: HTMLElement | null, className: string): void {
  if (element && className) {
    element.classList.add(className);
  }
}

/**
 * Remove a class from an element
 */
export function removeClass(element: HTMLElement | null, className: string): void {
  if (element && className) {
    element.classList.remove(className);
  }
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

