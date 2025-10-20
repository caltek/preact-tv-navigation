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
      let retryCount = 0;
      const maxRetries = 20;
      const minAcceptableSize = 100; // Don't accept sizes smaller than this (likely incorrect)
      
      const measureSize = () => {
        if (!containerRef.current) return;
        
        const size = isVertical ? containerRef.current.offsetHeight : containerRef.current.offsetWidth;
        
        // For Chrome 38: sometimes initial measurements are incorrect due to flex layout timing
        // Keep retrying until we get a reasonable size
        if (size >= minAcceptableSize) {
          console.log('✅ Accepted size:', size, 'px');
          setListSizeInPx(size);
          setHasAlreadyRendered(true);
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏱️ Size too small (${size}px), retrying... (${retryCount}/${maxRetries})`);
          // Chrome 38 fallback: retry with increasing delays
          setTimeout(measureSize, retryCount * 20);
        } else {
          console.warn('⚠️ Using small size:', size, 'px after', maxRetries, 'attempts');
          // Use it anyway if we've exhausted retries
          setListSizeInPx(size);
          setHasAlreadyRendered(true);
        }
      };
      
      // Start measurement after a small delay to let flex layout calculate
      setTimeout(measureSize, 10);
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

  console.log('📏 VirtualizedListWithSize:', { hasAlreadyRendered, listSizeInPx });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        // Chrome 38 compatibility: ensure proper box model
        boxSizing: 'border-box',
        // Force a layout context and clipping
        position: 'relative',
        overflow: 'hidden',
        // Ensure flex behavior
        flex: '1 1 auto',
        // Ensure minimum dimensions
        minWidth: 0,
        minHeight: 0,
      }}
      data-testid={props.testID ? props.testID + '-size-giver' : undefined}
    >
      {hasAlreadyRendered && listSizeInPx > 0 ? (
        <VirtualizedList {...props} listSizeInPx={listSizeInPx} />
      ) : (
        <div style={{ color: 'yellow', padding: '20px', backgroundColor: 'red' }}>
          ⏳ Measuring... rendered: {String(hasAlreadyRendered)}, size: {listSizeInPx}px
        </div>
      )}
    </div>
  );
}

