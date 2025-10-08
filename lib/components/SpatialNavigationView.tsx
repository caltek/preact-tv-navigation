import type { SpatialNavigationViewProps } from '../types';

/**
 * SpatialNavigationView - Simple wrapper around SpatialNavigationNode
 * Used to create non-focusable container nodes with specific orientation
 */
export function SpatialNavigationView({
  direction = 'horizontal',
  alignInGrid = false,
  children,
}: SpatialNavigationViewProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
      }}
      data-orientation={direction}
      data-align-in-grid={alignInGrid}
    >
      {children}
    </div>
  );
}

