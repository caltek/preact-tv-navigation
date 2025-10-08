import { useEffect, useRef, useMemo } from 'preact/hooks';
import type { GridProps } from '../types';
import { generateSectionId } from '../utils/helpers';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Grid component for managing focusable items in a grid layout
 * Automatically handles spatial navigation within the grid
 * 
 * @example
 * ```tsx
 * <Grid columns={3} gap="10px">
 *   {items.map(item => (
 *     <GridItem key={item.id}>{item.content}</GridItem>
 *   ))}
 * </Grid>
 * ```
 */
export function Grid({
  children,
  columns = 3,
  gap = '10px',
  className = '',
  style = {},
  id,
  enterTo = 'last-focused',
  restrict = 'self-first',
  disabled = false,
  rememberLastFocus = true,
  defaultElement = '',
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate stable section ID
  const sectionId = useMemo(() => id || generateSectionId('grid'), [id]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Register this grid as a section with js-spatial-navigation
    SpatialNavigation.add(sectionId, {
      selector: '.focusable',
      enterTo: rememberLastFocus ? enterTo : 'default-element',
      restrict,
      disabled,
      defaultElement,
    });

    // Make focusable elements within this section focusable
    SpatialNavigation.makeFocusable(sectionId);

    return () => {
      SpatialNavigation.remove(sectionId);
    };
  }, [sectionId, enterTo, restrict, disabled, rememberLastFocus, defaultElement]);

  // Re-make focusable when children change
  useEffect(() => {
    const timer = setTimeout(() => {
      SpatialNavigation.makeFocusable(sectionId);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [children, sectionId]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      id={sectionId}
      className={`spatial-grid ${className}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
}

