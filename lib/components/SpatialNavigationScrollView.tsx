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

  // Backward-compatible smooth scroll for older browsers (e.g., Chrome 38 on LG TVs)
  const smoothScroll = useCallback(
    (
      container: HTMLDivElement,
      targetLeft: number | undefined,
      targetTop: number | undefined,
      durationMs: number,
    ) => {
      const supportsScrollToOptions = typeof (container as any).scrollTo === 'function';
      // If native scrollTo with options is available, use it for smooth behavior
      if (supportsScrollToOptions && typeof window !== 'undefined') {
        try {
          (container as any).scrollTo({
            left: targetLeft,
            top: targetTop,
            behavior: 'smooth',
          });
          return;
        } catch {
          // Fall through to manual animation if options not supported
        }
      }

      // Manual animation fallback using requestAnimationFrame
      const startLeft = container.scrollLeft;
      const startTop = container.scrollTop;
      const deltaLeft = typeof targetLeft === 'number' ? targetLeft - startLeft : 0;
      const deltaTop = typeof targetTop === 'number' ? targetTop - startTop : 0;
      const startTime = Date.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, durationMs > 0 ? elapsed / durationMs : 1);
        const eased = easeOutCubic(progress);

        if (typeof targetLeft === 'number') {
          container.scrollLeft = Math.round(startLeft + deltaLeft * eased);
        }
        if (typeof targetTop === 'number') {
          container.scrollTop = Math.round(startTop + deltaTop * eased);
        }

        if (progress < 1) {
          if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
            requestAnimationFrame(step);
          } else {
            setTimeout(step, 16);
          }
        }
      };

      step();
    },
    [],
  );

  const scrollToNode: ScrollToNodeCallback = useCallback(
    (newlyFocusedElementRef, additionalOffset = 0) => {
      if (!scrollViewRef.current) return;
      if (!newlyFocusedElementRef) return;

      // Get the element from the ref
      const element = typeof newlyFocusedElementRef === 'object' && 'current' in newlyFocusedElementRef
        ? newlyFocusedElementRef.current
        : null;

      if (!element) return;

      // Calculate position relative to scroll container
      const container = scrollViewRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (horizontal) {
        const elementLeft = elementRect.left - containerRect.left + container.scrollLeft;
        const targetScroll = elementLeft - (offsetFromStart + additionalOffset);
        smoothScroll(container, targetScroll, undefined, _scrollDuration);
      } else {
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScroll = elementTop - (offsetFromStart + additionalOffset);
        smoothScroll(container, undefined, targetScroll, _scrollDuration);
      }

      // Propagate to parent scrollviews if nested
      makeParentsScrollToNodeIfNeeded(newlyFocusedElementRef, additionalOffset);
    },
    [makeParentsScrollToNodeIfNeeded, horizontal, offsetFromStart],
  );

  const containerStyle: JSX.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };

  const scrollViewStyle: JSX.CSSProperties = {
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    overflowX: horizontal ? 'auto' : 'hidden',
    overflowY: horizontal ? 'hidden' : 'auto',
    // Avoid relying on CSS smooth behavior for old browsers
    width: '100%',
    height: '100%',
    padding: '20px',
    boxSizing: 'border-box',
  };

  return (
    <SpatialNavigatorParentScrollContext.Provider value={scrollToNode}>
      <div style={containerStyle} data-testid={testID}>
        // Ascending arrow (top/left)
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

        // Scroll container
        <div ref={scrollViewRef} style={scrollViewStyle}>
          {children}
        </div>

        // Descending arrow (bottom/right)
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
