import { useEffect, useRef } from 'preact/hooks';
import type { SpatialNavigationScrollViewProps } from '../types';
import { navigationEventBus } from '../utils/eventBus';
import { SpatialNavigationNode } from './SpatialNavigationNode';

/**
 * SpatialNavigationScrollView - Auto-scrolling container
 * Automatically scrolls to keep focused elements visible
 */
export function SpatialNavigationScrollView({
  horizontal = false,
  offsetFromStart = 0,
  style = {},
  children,
  ascendingArrow,
  ascendingArrowContainerStyle = {},
  descendingArrow,
  descendingArrowContainerStyle = {},
  pointerScrollSpeed = 10,
  useNativeScroll = false,
}: SpatialNavigationScrollViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ascendingIntervalRef = useRef<number | null>(null);
  const descendingIntervalRef = useRef<number | null>(null);

  // Handle focus events to scroll focused element into view
  useEffect(() => {
    const handleFocus = (_detail: any) => {
      if (!scrollContainerRef.current) return;

      const focusedElement = document.activeElement as HTMLElement;
      if (!focusedElement) return;

      // Check if focused element is within this scroll container
      if (!scrollContainerRef.current.contains(focusedElement)) return;

      // Use CSS scrollIntoView for smooth scrolling (default)
      if (!useNativeScroll) {
        try {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });

          // Apply offsetFromStart by adjusting scroll position
          if (offsetFromStart > 0) {
            setTimeout(() => {
              if (scrollContainerRef.current) {
                if (horizontal) {
                  scrollContainerRef.current.scrollLeft -= offsetFromStart;
                } else {
                  scrollContainerRef.current.scrollTop -= offsetFromStart;
                }
              }
            }, 100);
          }
        } catch (error) {
          // Fallback to manual scroll if scrollIntoView fails
          scrollIntoViewManually(focusedElement);
        }
      } else {
        // Use native JS scroll
        scrollIntoViewManually(focusedElement);
      }
    };

    const scrollIntoViewManually = (element: HTMLElement) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (horizontal) {
        const elementLeft = elementRect.left - containerRect.left + container.scrollLeft;
        const targetScroll = elementLeft - offsetFromStart;
        
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth',
        });
      } else {
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScroll = elementTop - offsetFromStart;
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
      }
    };

    navigationEventBus.on('focus', handleFocus);

    return () => {
      navigationEventBus.off('focus', handleFocus);
    };
  }, [horizontal, offsetFromStart, useNativeScroll]);

  // Handle pointer scroll arrows
  const startScrolling = (direction: 'ascending' | 'descending') => {
    const intervalId = window.setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = pointerScrollSpeed;
        
        if (horizontal) {
          scrollContainerRef.current.scrollLeft += 
            direction === 'descending' ? scrollAmount : -scrollAmount;
        } else {
          scrollContainerRef.current.scrollTop += 
            direction === 'descending' ? scrollAmount : -scrollAmount;
        }
      }
    }, 10); // Scroll every 10ms

    if (direction === 'ascending') {
      ascendingIntervalRef.current = intervalId;
    } else {
      descendingIntervalRef.current = intervalId;
    }
  };

  const stopScrolling = (direction: 'ascending' | 'descending') => {
    const intervalRef = direction === 'ascending' 
      ? ascendingIntervalRef.current 
      : descendingIntervalRef.current;
    
    if (intervalRef !== null) {
      clearInterval(intervalRef);
      
      if (direction === 'ascending') {
        ascendingIntervalRef.current = null;
      } else {
        descendingIntervalRef.current = null;
      }
    }
  };

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (ascendingIntervalRef.current) clearInterval(ascendingIntervalRef.current);
      if (descendingIntervalRef.current) clearInterval(descendingIntervalRef.current);
    };
  }, []);

  const containerStyle: any = {
    overflow: 'hidden', // Clip items that extend beyond container bounds
    position: 'relative',
    ...style,
  };

  const scrollViewStyle: any = {
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    scrollBehavior: 'smooth',
    // No overflow: auto - we clip with the parent's overflow: hidden
    // and use scrollIntoView() to bring focused items into view
  };

  return (
    <div style={containerStyle}>
      {/* Ascending arrow (top/left) */}
      {ascendingArrow && (
        <div
          style={{
            position: 'absolute',
            [horizontal ? 'left' : 'top']: 0,
            zIndex: 10,
            ...ascendingArrowContainerStyle,
          }}
          onMouseEnter={() => startScrolling('ascending')}
          onMouseLeave={() => stopScrolling('ascending')}
        >
          {ascendingArrow}
        </div>
      )}

      {/* Scroll container wrapped in SpatialNavigationNode with section registration */}
      <SpatialNavigationNode
        orientation={horizontal ? 'horizontal' : 'vertical'}
        isFocusable={false}
        registerSection={true}
        restrict="self-only"
      >
        <div ref={scrollContainerRef} style={scrollViewStyle}>
          {children}
        </div>
      </SpatialNavigationNode>

      {/* Descending arrow (bottom/right) */}
      {descendingArrow && (
        <div
          style={{
            position: 'absolute',
            [horizontal ? 'right' : 'bottom']: 0,
            zIndex: 10,
            ...descendingArrowContainerStyle,
          }}
          onMouseEnter={() => startScrolling('descending')}
          onMouseLeave={() => stopScrolling('descending')}
        >
          {descendingArrow}
        </div>
      )}
    </div>
  );
}

