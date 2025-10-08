import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Orientation } from '../types';
import { SpatialNavigationNode } from './SpatialNavigationNode';
import { SpatialNavigationScrollView } from './SpatialNavigationScrollView';

/**
 * Props for SpatialNavigationVirtualizedList
 */
export interface SpatialNavigationVirtualizedListProps<T = any> {
  /** Array of data items */
  data: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number, isFocused: boolean) => JSX.Element;
  /** Height of each item in pixels (required for vertical lists) */
  itemHeight?: number;
  /** Width of each item in pixels (required for horizontal lists) */
  itemWidth?: number;
  /** Orientation of the list */
  orientation?: Orientation;
  /** Number of items to render outside visible area (default: 5) */
  overscan?: number;
  /** Container style */
  style?: JSX.CSSProperties;
  /** Callback when an item is focused */
  onItemFocus?: (item: T, index: number) => void;
  /** Callback when an item is selected */
  onItemSelect?: (item: T, index: number) => void;
}

/**
 * SpatialNavigationVirtualizedList - Virtualized list for performance
 * Only renders visible items plus overscan to handle large datasets efficiently
 * 
 * @example
 * ```tsx
 * const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, title: `Item ${i}` }));
 * 
 * <SpatialNavigationVirtualizedList
 *   data={data}
 *   itemHeight={60}
 *   renderItem={(item, index, isFocused) => (
 *     <div style={{ height: '60px' }}>
 *       {item.title} {isFocused && '(focused)'}
 *     </div>
 *   )}
 * />
 * ```
 */
export function SpatialNavigationVirtualizedList<T = any>({
  data,
  renderItem,
  itemHeight = 60,
  itemWidth = 200,
  orientation = 'vertical',
  overscan = 5,
  style = {},
  onItemFocus,
  onItemSelect,
}: SpatialNavigationVirtualizedListProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: overscan * 2 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isHorizontal = orientation === 'horizontal';
  const itemSize = isHorizontal ? itemWidth : itemHeight;

  // Calculate visible range based on scroll position
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const scrollPos = isHorizontal
      ? containerRef.current.scrollLeft
      : containerRef.current.scrollTop;
    
    const containerSize = isHorizontal
      ? containerRef.current.clientWidth
      : containerRef.current.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollPos / itemSize) - overscan);
    const endIndex = Math.min(
      data.length,
      Math.ceil((scrollPos + containerSize) / itemSize) + overscan
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [data.length, itemSize, overscan, isHorizontal]);

  // Update visible range on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateVisibleRange);
    updateVisibleRange(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [updateVisibleRange]);

  // Update visible range when focused index changes
  useEffect(() => {
    setVisibleRange({
      start: Math.max(0, focusedIndex - overscan),
      end: Math.min(data.length, focusedIndex + overscan * 2),
    });
  }, [focusedIndex, overscan, data.length]);

  const handleItemFocus = useCallback((item: T, index: number) => {
    setFocusedIndex(index);
    if (onItemFocus) {
      onItemFocus(item, index);
    }
  }, [onItemFocus]);

  const handleItemSelect = useCallback((item: T, index: number) => {
    if (onItemSelect) {
      onItemSelect(item, index);
    }
  }, [onItemSelect]);

  // Get visible items
  const visibleItems = data.slice(visibleRange.start, visibleRange.end);
  const offsetBefore = visibleRange.start * itemSize;
  const offsetAfter = (data.length - visibleRange.end) * itemSize;

  const listStyle: JSX.CSSProperties = {
    ...style,
    position: 'relative',
    overflow: isHorizontal ? 'auto' : 'auto',
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
  };

  const spacerBeforeStyle: JSX.CSSProperties = isHorizontal
    ? { minWidth: `${offsetBefore}px`, width: `${offsetBefore}px` }
    : { minHeight: `${offsetBefore}px`, height: `${offsetBefore}px` };

  const spacerAfterStyle: JSX.CSSProperties = isHorizontal
    ? { minWidth: `${offsetAfter}px`, width: `${offsetAfter}px` }
    : { minHeight: `${offsetAfter}px`, height: `${offsetAfter}px` };

  return (
    <SpatialNavigationScrollView
      horizontal={isHorizontal}
      style={listStyle}
    >
      <>
        {/* Spacer before visible items */}
        {offsetBefore > 0 && <div style={spacerBeforeStyle} />}

        {/* Render only visible items */}
        {visibleItems.map((item, relativeIndex) => {
          const absoluteIndex = visibleRange.start + relativeIndex;
          const isFocused = absoluteIndex === focusedIndex;

          return (
            <SpatialNavigationNode
              key={absoluteIndex}
              isFocusable={true}
              onFocus={() => handleItemFocus(item, absoluteIndex)}
              onSelect={() => handleItemSelect(item, absoluteIndex)}
            >
              {() => (
                <div
                  style={{
                    [isHorizontal ? 'minWidth' : 'minHeight']: `${itemSize}px`,
                    [isHorizontal ? 'width' : 'height']: `${itemSize}px`,
                  }}
                >
                  {renderItem(item, absoluteIndex, isFocused)}
                </div>
              )}
            </SpatialNavigationNode>
          );
        })}

        {/* Spacer after visible items */}
        {offsetAfter > 0 && <div style={spacerAfterStyle} />}
      </>
    </SpatialNavigationScrollView>
  );
}

