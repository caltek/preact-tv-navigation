import { useEffect, useRef, useMemo } from 'preact/hooks';
import type { ListProps } from '../types';
import { generateSectionId } from '../utils/helpers';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * List component for managing focusable items in a list layout
 * Automatically handles spatial navigation within the list
 * 
 * @example
 * ```tsx
 * <List orientation="vertical" gap="5px">
 *   {items.map(item => (
 *     <ListItem key={item.id}>{item.content}</ListItem>
 *   ))}
 * </List>
 * ```
 */
export function List({
  children,
  orientation = 'vertical',
  gap = '10px',
  className = '',
  style = {},
  id,
  enterTo = 'last-focused',
  restrict = 'self-first',
  disabled = false,
  rememberLastFocus = true,
  defaultElement = '',
}: ListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate stable section ID
  const sectionId = useMemo(() => id || generateSectionId('list'), [id]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Register this list as a section with js-spatial-navigation
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

  const listStyle = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      id={sectionId}
      className={`spatial-list spatial-list-${orientation} ${className}`}
      style={listStyle}
    >
      {children}
    </div>
  );
}

