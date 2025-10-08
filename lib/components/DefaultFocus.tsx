import { useEffect } from 'preact/hooks';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Props for DefaultFocus component
 */
export interface DefaultFocusProps {
  /** Whether to enable default focus on mount */
  enabled?: boolean;
}

/**
 * DefaultFocus - Automatically focuses the first focusable element on mount
 * Place this component within a section to auto-focus on initial render
 */
export function DefaultFocus({ enabled = true }: DefaultFocusProps = {}) {
  useEffect(() => {
    if (!enabled) return;

    // Focus the first available focusable element after a short delay
    const timer = setTimeout(() => {
      SpatialNavigation.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [enabled]);

  // This component doesn't render anything
  return null;
}

