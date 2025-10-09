import type { ComponentChildren, JSX } from 'preact';
import { forwardRef } from 'preact/compat';
import { SpatialNavigationNode } from './SpatialNavigationNode';
import type { SpatialNavigationNodeRef } from '../types';

type Props = {
  children: ComponentChildren;
  style?: JSX.CSSProperties;
  direction: 'horizontal' | 'vertical';
  alignInGrid?: boolean;
};

export const SpatialNavigationView = forwardRef<SpatialNavigationNodeRef, Props>(
  ({ direction = 'horizontal', alignInGrid = false, children, style }: Props, ref) => {
    const flexDirection = direction === 'horizontal' ? 'row' : 'column';
    
    return (
      <SpatialNavigationNode orientation={direction} alignInGrid={alignInGrid} ref={ref}>
        <div
          style={{
            ...style,
            display: 'flex',
            flexDirection,
          }}
        >
          {children}
        </div>
      </SpatialNavigationNode>
    );
  },
);
SpatialNavigationView.displayName = 'SpatialNavigationView';
