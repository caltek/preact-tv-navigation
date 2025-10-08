import { useCallback } from 'preact/hooks';
import type { JSX } from 'preact';
import type { SpatialNavigationFocusableViewProps } from '../types';
import { SpatialNavigationNode } from './SpatialNavigationNode';

/**
 * SpatialNavigationFocusableView - Focusable wrapper with hover support
 * Automatically focuses on mouse enter for web TV pointer/cursor support
 */
export function SpatialNavigationFocusableView({
  onFocus,
  onBlur,
  onSelect,
  onLongSelect,
  onActive,
  onInactive,
  orientation = 'vertical',
  alignInGrid = false,
  indexRange,
  additionalOffset = 0,
  style = {},
  viewProps = {},
  children,
}: SpatialNavigationFocusableViewProps) {
  // Handle mouse enter to focus (for web TV pointer/cursor)
  const handleMouseEnter = useCallback((event: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target) {
      target.focus();
    }
    
    if (viewProps.onMouseEnter) {
      viewProps.onMouseEnter(event);
    }
  }, [viewProps]);

  return (
    <SpatialNavigationNode
      onFocus={onFocus}
      onBlur={onBlur}
      onSelect={onSelect}
      onLongSelect={onLongSelect}
      onActive={onActive}
      onInactive={onInactive}
      orientation={orientation}
      isFocusable={true}
      alignInGrid={alignInGrid}
      indexRange={indexRange}
      additionalOffset={additionalOffset}
    >
      {({ isFocused, isActive, isRootActive }) => (
        <div 
          {...viewProps}
          style={style}
          onMouseEnter={handleMouseEnter}
        >
          {children({ isFocused, isActive, isRootActive })}
        </div>
      )}
    </SpatialNavigationNode>
  );
}

