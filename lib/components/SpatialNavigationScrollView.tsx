import { useCallback, useRef } from 'preact/hooks';
import type { Ref, ComponentChildren, JSX } from 'preact';
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
  pointerScrollSpeed = 10,
  useNativeScroll = false,
  scrollDuration = 200,
  testID,
}: Props) {
  const { scrollToNodeIfNeeded: makeParentsScrollToNodeIfNeeded } =
    useSpatialNavigatorParentScroll();
  const scrollViewRef = useRef<HTMLDivElement>(null);

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
        
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth',
        });
      } else {
        const elementTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScroll = elementTop - (offsetFromStart + additionalOffset);
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });
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
    scrollBehavior: 'smooth',
    width: '100%',
    height: '100%',
    padding: '20px',
    boxSizing: 'border-box',
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
