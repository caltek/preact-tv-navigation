import { useState, useRef, useEffect } from 'preact/hooks';
import { VirtualizedList, type VirtualizedListProps } from './VirtualizedList';

/**
 * This component has for only purpose to give to the VirtualizedList its actual
 * width and height. It is used to avoid the VirtualizedList to render with a width
 * or height not defined (as it is used later for computing offsets for example).
 * The size is computed only once and then the VirtualizedList is rendered. This
 * doesn't support dynamic size changes.
 */
export function VirtualizedListWithSize<T>(props: Omit<VirtualizedListProps<T>, 'listSizeInPx'>) {
  const isVertical = props.orientation === 'vertical';
  const containerRef = useRef<HTMLDivElement>(null);
  const [listSizeInPx, setListSizeInPx] = useState<number>(0);
  const [hasAlreadyRendered, setHasAlreadyRendered] = useState<boolean>(false);

  useEffect(() => {
    if (!hasAlreadyRendered && containerRef.current) {
      const size = isVertical ? containerRef.current.offsetHeight : containerRef.current.offsetWidth;
      if (size !== 0) {
        setListSizeInPx(size);
        setHasAlreadyRendered(true);
      }
    }
  }, [hasAlreadyRendered, isVertical]);

  // Use ResizeObserver for dynamic sizing (optional enhancement) - with polyfill check
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if ResizeObserver is available (Chrome 64+, not available in Chrome 35)
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const size = isVertical ? entry.contentRect.height : entry.contentRect.width;
          if (size !== 0 && !hasAlreadyRendered) {
            setListSizeInPx(size);
            setHasAlreadyRendered(true);
          }
        }
      });

      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }
    // Fallback for older browsers - rely on initial measurement only
  }, [hasAlreadyRendered, isVertical]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
      data-testid={props.testID ? props.testID + '-size-giver' : undefined}
    >
      {hasAlreadyRendered && listSizeInPx > 0 && (
        <VirtualizedList {...props} listSizeInPx={listSizeInPx} />
      )}
    </div>
  );
}

