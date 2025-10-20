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
      const minAcceptableSize = 100;
      
      const measureSize = () => {
        if (!containerRef.current) return;
        
        let size = isVertical ? containerRef.current.offsetHeight : containerRef.current.offsetWidth;
        
        // Chrome 38 fallback: if flex layout fails, calculate from viewport
        if (size < minAcceptableSize && typeof window !== 'undefined') {
          console.warn('⚠️ Flex layout returned small size:', size, 'px. Calculating from viewport...');
          
          // Walk up the DOM tree to find a sized parent
          let parent = containerRef.current.parentElement;
          let attempts = 0;
          while (parent && attempts < 10) {
            const parentSize = isVertical ? parent.offsetHeight : parent.offsetWidth;
            if (parentSize >= minAcceptableSize) {
              console.log('✅ Found sized parent:', parentSize, 'px');
              size = parentSize;
              break;
            }
            parent = parent.parentElement;
            attempts++;
          }
          
          // Ultimate fallback: use viewport dimensions
          if (size < minAcceptableSize) {
            if (isVertical) {
              // Viewport height minus header (100px) and footer (50px) and padding (40px)
              size = window.innerHeight - 190;
              console.log('✅ Using viewport height:', window.innerHeight, '- 190px =', size, 'px');
            } else {
              size = window.innerWidth;
              console.log('✅ Using viewport width:', size, 'px');
            }
          }
        } else {
          console.log('✅ Measured size from container:', size, 'px');
        }
        
        setListSizeInPx(size);
        setHasAlreadyRendered(true);
      };
      
      // Small delay to let DOM settle
      setTimeout(measureSize, 100);
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
      {/* Chrome 38 fix: visible element during measurement to force proper flex sizing */}
      {!hasAlreadyRendered && (
        <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '12px'
        }}>
          Loading...
        </div>
      )}
      {hasAlreadyRendered && listSizeInPx > 0 && (
        <VirtualizedList {...props} listSizeInPx={listSizeInPx} />
      )}
    </div>
  );
}

