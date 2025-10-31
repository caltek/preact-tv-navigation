import { useCallback, useRef } from 'preact/hooks';
import type { ComponentChildren, JSX } from 'preact';
import {
  ParentScrollContext as SpatialNavigatorParentScrollContext,
  useSpatialNavigatorParentScroll,
  type ScrollToNodeCallback,
} from '../context/ParentScrollContext';

type Props = {
  horizontal?: boolean;
  /**
   * Use this offset to prevent the element from sticking too closely to the edges of the screen during scrolling.
   * This is a margin in pixels.
   */
  offsetFromStart?: number;
  children: ComponentChildren;
  style?: JSX.CSSProperties;
  /** Arrow that will show up inside the arrowContainer */
  descendingArrow?: JSX.Element;
  /** Arrow that will show up inside the arrowContainer */
  ascendingArrow?: JSX.Element;
  /** Style props for the arrow container, basically the area hoverable that triggers a scroll  */
  descendingArrowContainerStyle?: JSX.CSSProperties;
  /** Style props for the arrow container, basically the area hoverable that triggers a scroll  */
  ascendingArrowContainerStyle?: JSX.CSSProperties;
  /** Number of pixels scrolled every 10ms - only when using web cursor pointer to scroll */
  pointerScrollSpeed?: number;
  /** Toggles the native scrolling version of the scroll view instead of the CSS scroll */
  useNativeScroll?: boolean;
  /** Configures the scroll duration in the case of CSS scroll */
  scrollDuration?: number;
  testID?: string;
};

export function SpatialNavigationScrollView({
  horizontal = false,
  style,
  offsetFromStart = 0,
  children,
  ascendingArrow,
  ascendingArrowContainerStyle,
  descendingArrow,
  descendingArrowContainerStyle,
  pointerScrollSpeed: _pointerScrollSpeed = 10,
  useNativeScroll: _useNativeScroll = false,
  scrollDuration: _scrollDuration = 200,
  testID,
}: Props) {
  const { scrollToNodeIfNeeded: makeParentsScrollToNodeIfNeeded } =
    useSpatialNavigatorParentScroll();
  const scrollViewRef = useRef<HTMLDivElement>(null);

  // Legacy browser compatible smooth scroll using setTimeout only
  const smoothScroll = useCallback(
    (
      container: HTMLDivElement,
      targetLeft: number | undefined,
      targetTop: number | undefined,
      durationMs: number,
    ) => {
      const startLeft = container.scrollLeft;
      const startTop = container.scrollTop;
      const deltaLeft = typeof targetLeft === 'number' ? targetLeft - startLeft : 0;
      const deltaTop = typeof targetTop === 'number' ? targetTop - startTop : 0;
      const startTime = Date.now();

      // Chrome 38 compatible easing function
      const easeOutCubic = (t: number) => {
        const t1 = 1 - t;
        return 1 - (t1 * t1 * t1);
      };

      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, durationMs > 0 ? elapsed / durationMs : 1);
        const eased = easeOutCubic(progress);

        if (typeof targetLeft === 'number') {
          const newLeft = Math.round(startLeft + deltaLeft * eased);
          // Chrome 38 compatible scroll setting
          container.scrollLeft = newLeft;
        }
        if (typeof targetTop === 'number') {
          const newTop = Math.round(startTop + deltaTop * eased);
          // Chrome 38 compatible scroll setting
          container.scrollTop = newTop;
        }

        if (progress < 1) {
          // Use setTimeout for legacy browser compatibility (Chrome 38)
          // Use 16ms for 60fps, but fallback to 20ms for very old browsers
          const timeout = typeof requestAnimationFrame !== 'undefined' ? 16 : 20;
          setTimeout(step, timeout);
        }
      };

      step();
    },
    [],
  );

  const scrollToNode: ScrollToNodeCallback = useCallback(
    (newlyFocusedElementRef, additionalOffset = 0) => {
      if (!scrollViewRef.current) {
        console.warn('❌ SpatialNavigationScrollView: scrollViewRef.current is null');
        return;
      }
      if (!newlyFocusedElementRef) {
        console.warn('❌ SpatialNavigationScrollView: newlyFocusedElementRef is null');
        return;
      }

      // Get the element from the ref
      const element = typeof newlyFocusedElementRef === 'object' && 'current' in newlyFocusedElementRef
        ? newlyFocusedElementRef.current
        : null;

      if (!element) {
        console.warn('❌ SpatialNavigationScrollView: element is null');
        return;
      }

      // Calculate scroll position using the original smoothScroll approach
      const container = scrollViewRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      let targetLeft: number | undefined;
      let targetTop: number | undefined;

      if (horizontal) {
        const elementLeft = elementRect.left - containerRect.left + container.scrollLeft;
        const containerWidth = container.clientWidth;
        const elementWidth = elementRect.width;
        
        // Center the element horizontally
        targetLeft = elementLeft - (containerWidth - elementWidth) / 2;
        
        // Apply offset
        if (offsetFromStart > 0 || additionalOffset > 0) {
          targetLeft = targetLeft - (offsetFromStart + additionalOffset);
        }
        
        // Ensure we don't scroll beyond bounds
        targetLeft = Math.max(0, Math.min(targetLeft, container.scrollWidth - containerWidth));
      } else {
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const containerHeight = container.clientHeight;
        const elementHeight = elementRect.height;
        
        // Center the element vertically
        targetTop = elementTop - (containerHeight - elementHeight) / 2;
        
        // Apply offset
        if (offsetFromStart > 0 || additionalOffset > 0) {
          targetTop = targetTop - (offsetFromStart + additionalOffset);
        }
        
        // Ensure we don't scroll beyond bounds
        targetTop = Math.max(0, Math.min(targetTop, container.scrollHeight - containerHeight));
      }

      // Use smooth scroll for all browsers
      smoothScroll(container, targetLeft, targetTop, _scrollDuration);
      
      // Propagate to parent scrollviews if nested
      makeParentsScrollToNodeIfNeeded(newlyFocusedElementRef, additionalOffset);
    },
    [makeParentsScrollToNodeIfNeeded, horizontal, offsetFromStart, _scrollDuration, smoothScroll],
  );

  const containerStyle: JSX.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };

  const scrollViewStyle: JSX.CSSProperties = {
    // Chrome 38 specific: Use block layout instead of flexbox for scroll containers
    display: 'block',
    // Avoid relying on CSS smooth behavior for old browsers
    width: '100%',
    height: '100%',
    padding: '20px',
    boxSizing: 'border-box',
    // Chrome 38 specific fixes
    WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS/Chrome
    position: 'relative', // Ensure proper positioning context
    // Chrome 38 scroll container fixes
    WebkitTransform: 'translateZ(0)', // Force hardware acceleration
    transform: 'translateZ(0)',
    // Force scroll container to be scrollable in Chrome 38
    minHeight: 0,
    minWidth: 0,
    // Chrome 38 specific: Ensure proper overflow behavior - CRITICAL FOR CHROME 38
    overflowX: horizontal ? 'auto' : 'hidden',
    overflowY: horizontal ? 'hidden' : 'auto',
    // Chrome 38 fix: Force the container to be scrollable
    maxHeight: horizontal ? 'none' : '100%',
    maxWidth: horizontal ? '100%' : 'none',
  };

  return (
    <SpatialNavigatorParentScrollContext.Provider value={scrollToNode}>
      <div style={containerStyle} data-testid={testID}>
        {/* Ascending arrow (top/left) */}
        {ascendingArrow && (
          <div
            style={{
              position: 'absolute',
              [horizontal ? 'left' : 'top']: 0,
              zIndex: 10,
              ...ascendingArrowContainerStyle,
            }}
          >
            {ascendingArrow}
          </div>
        )}
        {/* Scroll container */}
        <div ref={scrollViewRef} style={scrollViewStyle}>
          {children}
        </div>
        {/* Descending arrow (bottom/right) */}
        {descendingArrow && (
          <div
            style={{
              position: 'absolute',
              [horizontal ? 'right' : 'bottom']: 0,
              zIndex: 10,
              ...descendingArrowContainerStyle,
            }}
          >
            {descendingArrow}
          </div>
        )}
      </div>
    </SpatialNavigatorParentScrollContext.Provider>
  );
}
