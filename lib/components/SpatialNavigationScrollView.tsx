import { useCallback, useRef, useEffect } from 'preact/hooks';
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

  // Debug scroll container dimensions on mount and when content changes
  useEffect(() => {
    if (scrollViewRef.current) {
      const container = scrollViewRef.current;
      console.log('🔍 SpatialNavigationScrollView: Mounted with dimensions', {
        horizontal,
        clientHeight: container.clientHeight,
        clientWidth: container.clientWidth,
        scrollHeight: container.scrollHeight,
        scrollWidth: container.scrollWidth,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        offsetHeight: container.offsetHeight,
        offsetWidth: container.offsetWidth,
        isScrollable: container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth,
      });

      // Add scroll event listener for debugging
      const handleScroll = () => {
        console.log('📜 SpatialNavigationScrollView: Scroll event', {
          scrollTop: container.scrollTop,
          scrollLeft: container.scrollLeft,
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          maxScrollTop: container.scrollHeight - container.clientHeight,
          isAtBottom: container.scrollTop >= (container.scrollHeight - container.clientHeight - 1),
        });
      };

      container.addEventListener('scroll', handleScroll);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [horizontal, children]);

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

      console.log('🎬 SpatialNavigationScrollView: Starting smooth scroll', {
        startPosition: { left: startLeft, top: startTop },
        targetPosition: { left: targetLeft, top: targetTop },
        delta: { left: deltaLeft, top: deltaTop },
        duration: durationMs,
        containerScrollSize: {
          scrollWidth: container.scrollWidth,
          scrollHeight: container.scrollHeight,
        },
      });

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
          console.log('➡️ SpatialNavigationScrollView: Scroll step (horizontal)', {
            progress: Math.round(progress * 100) + '%',
            newLeft,
            targetLeft,
          });
        }
        if (typeof targetTop === 'number') {
          const newTop = Math.round(startTop + deltaTop * eased);
          // Chrome 38 compatible scroll setting
          container.scrollTop = newTop;
          console.log('⬇️ SpatialNavigationScrollView: Scroll step (vertical)', {
            progress: Math.round(progress * 100) + '%',
            newTop,
            targetTop,
          });
        }

        if (progress < 1) {
          // Use setTimeout for legacy browser compatibility (Chrome 38)
          // Use 16ms for 60fps, but fallback to 20ms for very old browsers
          const timeout = typeof requestAnimationFrame !== 'undefined' ? 16 : 20;
          setTimeout(step, timeout);
        } else {
          console.log('✅ SpatialNavigationScrollView: Smooth scroll completed', {
            finalPosition: {
              left: container.scrollLeft,
              top: container.scrollTop,
            },
          });
        }
      };

      step();
    },
    [],
  );

  const scrollToNode: ScrollToNodeCallback = useCallback(
    (newlyFocusedElementRef, additionalOffset = 0) => {
      console.log('🔄 SpatialNavigationScrollView.scrollToNode called', {
        horizontal,
        offsetFromStart,
        additionalOffset,
        hasScrollViewRef: !!scrollViewRef.current,
        hasElementRef: !!newlyFocusedElementRef,
        usingSmoothScroll: true,
      });

      // Log scroll container dimensions for debugging
      if (scrollViewRef.current) {
        const container = scrollViewRef.current;
        console.log('📏 SpatialNavigationScrollView: Container dimensions', {
          horizontal,
          clientHeight: container.clientHeight,
          clientWidth: container.clientWidth,
          scrollHeight: container.scrollHeight,
          scrollWidth: container.scrollWidth,
          scrollTop: container.scrollTop,
          scrollLeft: container.scrollLeft,
          offsetHeight: container.offsetHeight,
          offsetWidth: container.offsetWidth,
          canScrollHorizontally: container.scrollWidth > container.clientWidth,
          canScrollVertically: container.scrollHeight > container.clientHeight,
          computedStyle: {
            width: getComputedStyle(container).width,
            height: getComputedStyle(container).height,
            overflowX: getComputedStyle(container).overflowX,
            overflowY: getComputedStyle(container).overflowY,
            display: getComputedStyle(container).display,
          },
        });
      }

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

      console.log('✅ SpatialNavigationScrollView: Element found', {
        elementTag: element.tagName,
        elementId: element.id,
        elementClass: element.className,
      });

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
        
        console.log('➡️ SpatialNavigationScrollView: Calculated horizontal scroll', {
          elementLeft,
          containerWidth,
          elementWidth,
          targetLeft,
          offsetFromStart,
          additionalOffset,
        });
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
        
        console.log('⬇️ SpatialNavigationScrollView: Calculated vertical scroll', {
          elementTop,
          containerHeight,
          elementHeight,
          targetTop,
          offsetFromStart,
          additionalOffset,
          containerScrollHeight: container.scrollHeight,
        });
      }

      // Use smooth scroll for all browsers
      console.log('🎬 SpatialNavigationScrollView: Starting smooth scroll', {
        targetLeft,
        targetTop,
        duration: _scrollDuration,
      });
      
      smoothScroll(container, targetLeft, targetTop, _scrollDuration);
      
      // Propagate to parent scrollviews if nested
      console.log('🔄 SpatialNavigationScrollView: Propagating to parent scrollviews');
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
