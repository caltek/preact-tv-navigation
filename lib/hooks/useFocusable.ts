import { useRef, useCallback } from 'preact/hooks';
import type { FocusableConfig, UseFocusableReturn } from '../types';

/**
 * @deprecated This hook is deprecated and no longer functional after migrating to @bam.tech/lrud.
 * Please use the new SpatialNavigationNode component with render props pattern instead.
 * 
 * Migration example:
 * ```tsx
 * // Old API:
 * const { ref, focused } = useFocusable({ onEnterPress: handleSelect });
 * return <div ref={ref} className={focused ? 'focused' : ''}>Item</div>;
 * 
 * // New API:
 * return (
 *   <SpatialNavigationNode isFocusable onSelect={handleSelect}>
 *     {({ isFocused }) => (
 *       <div className={isFocused ? 'focused' : ''}>Item</div>
 *     )}
 *   </SpatialNavigationNode>
 * );
 * ```
 * 
 * @param config - Configuration (no longer used)
 * @returns Stub return object
 */
export function useFocusable(config: FocusableConfig = {}): UseFocusableReturn {
  console.error(
    '[preact-spatial-navigation] useFocusable is deprecated and no longer functional. ' +
    'Please migrate to SpatialNavigationNode with render props pattern. ' +
    'See documentation for migration guide.'
  );

  const elementRef = useRef<HTMLElement | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  const focus = useCallback(() => {
    console.warn('[preact-spatial-navigation] useFocusable.focus() is deprecated');
  }, []);

  const blur = useCallback(() => {
    console.warn('[preact-spatial-navigation] useFocusable.blur() is deprecated');
  }, []);

  return {
    ref: setRef,
    focused: false,
    focus,
    blur,
  };
}
