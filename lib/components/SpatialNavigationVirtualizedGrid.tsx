import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import { SpatialNavigationNode } from './SpatialNavigationNode';

/**
 * Props for SpatialNavigationVirtualizedGrid
 */
export interface SpatialNavigationVirtualizedGridProps<T = any> {
  /** Array of data items */
  data: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number, isFocused: boolean) => JSX.Element;
  /** Number of columns in the grid */
  columns: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Width of each item in pixels */
  itemWidth: number;
  /** Gap between items in pixels */
  gap?: number;
  /** Number of rows to render outside visible area (default: 2) */
  overscan?: number;
  /** Container style */
  style?: JSX.CSSProperties;
  /** Callback when an item is focused */
  onItemFocus?: (item: T, index: number) => void;
  /** Callback when an item is selected */
  onItemSelect?: (item: T, index: number) => void;
}

/**
 * SpatialNavigationVirtualizedGrid - Virtualized grid for performance
 * Only renders visible rows plus overscan to handle large datasets efficiently
 * 
 * @example
 * ```tsx
 * const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, title: `Item ${i}` }));
 * 
 * <SpatialNavigationVirtualizedGrid
 *   data={data}
 *   columns={5}
 *   itemHeight={150}
 *   itemWidth={200}
 *   gap={10}
 *   renderItem={(item, index, isFocused) => (
 *     <div>{item.title} {isFocused && '★'}</div>
 *   )}
 * />
 * ```
 */
export function SpatialNavigationVirtualizedGrid<T = any>({
  data,
  renderItem,
  columns,
  itemHeight,
  itemWidth,
  gap = 10,
  overscan = 2,
  style = {},
  onItemFocus,
  onItemSelect,
}: SpatialNavigationVirtualizedGridProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [visibleRowRange, setVisibleRowRange] = useState({ start: 0, end: overscan * 2 });
  const containerRef = useRef<HTMLDivElement>(null);

  const totalRows = Math.ceil(data.length / columns);
  const rowHeight = itemHeight + gap;

  // Calculate visible row range based on scroll position
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    setVisibleRowRange({ start: startRow, end: endRow });
  }, [totalRows, rowHeight, overscan]);

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
    const focusedRow = Math.floor(focusedIndex / columns);
    setVisibleRowRange({
      start: Math.max(0, focusedRow - overscan),
      end: Math.min(totalRows, focusedRow + overscan * 2),
    });
  }, [focusedIndex, columns, overscan, totalRows]);

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

  // Get visible rows
  const visibleRows = [];
  for (let row = visibleRowRange.start; row < visibleRowRange.end; row++) {
    const rowItems = [];
    const startIndex = row * columns;
    const endIndex = Math.min(startIndex + columns, data.length);

    for (let i = startIndex; i < endIndex; i++) {
      rowItems.push({ item: data[i], index: i });
    }

    if (rowItems.length > 0) {
      visibleRows.push({ row, items: rowItems });
    }
  }

  const offsetBefore = visibleRowRange.start * rowHeight;
  const offsetAfter = (totalRows - visibleRowRange.end) * rowHeight;

  const gridStyle: JSX.CSSProperties = {
    ...style,
    position: 'relative',
    overflow: 'auto',
  };

  const gridContentStyle: JSX.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const rowStyle: JSX.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: `${gap}px`,
    marginBottom: `${gap}px`,
  };

  return (
    <div ref={containerRef} style={gridStyle}>
      <div style={gridContentStyle}>
        {/* Spacer before visible rows */}
        {offsetBefore > 0 && (
          <div style={{ height: `${offsetBefore}px`, minHeight: `${offsetBefore}px` }} />
        )}

        {/* Render only visible rows */}
        {visibleRows.map(({ row, items }) => (
          <SpatialNavigationNode
            key={row}
            orientation="horizontal"
            alignInGrid={true}
            isFocusable={false}
          >
            <div style={rowStyle}>
              {items.map(({ item, index }) => {
                const isFocused = index === focusedIndex;

                return (
                  <SpatialNavigationNode
                    key={index}
                    isFocusable={true}
                    onFocus={() => handleItemFocus(item, index)}
                    onSelect={() => handleItemSelect(item, index)}
                  >
                    {() => (
                      <div
                        style={{
                          width: `${itemWidth}px`,
                          height: `${itemHeight}px`,
                          minWidth: `${itemWidth}px`,
                          minHeight: `${itemHeight}px`,
                        }}
                      >
                        {renderItem(item, index, isFocused)}
                      </div>
                    )}
                  </SpatialNavigationNode>
                );
              })}
            </div>
          </SpatialNavigationNode>
        ))}

        {/* Spacer after visible rows */}
        {offsetAfter > 0 && (
          <div style={{ height: `${offsetAfter}px`, minHeight: `${offsetAfter}px` }} />
        )}
      </div>
    </div>
  );
}

