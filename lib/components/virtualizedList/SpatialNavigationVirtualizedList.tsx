import type { JSX, Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { SpatialNavigationNode } from '../SpatialNavigationNode';
import {
  type PointerScrollProps,
  SpatialNavigationVirtualizedListWithScroll,
  type SpatialNavigationVirtualizedListWithScrollProps,
  type SpatialNavigationVirtualizedListRef,
} from './SpatialNavigationVirtualizedListWithScroll';

/**
 * Use this component to render horizontally or vertically virtualized lists with spatial navigation
 * This component wraps the virtualized list inside a parent navigation node.
 * */
export const SpatialNavigationVirtualizedList = forwardRef(
  <T,>(
    props: SpatialNavigationVirtualizedListWithScrollProps<T> & PointerScrollProps,
    ref: Ref<SpatialNavigationVirtualizedListRef>,
  ) => {
    return (
      <SpatialNavigationNode
        alignInGrid={props.isGrid !== undefined ? props.isGrid : false}
        orientation={props.orientation !== undefined ? props.orientation : 'horizontal'}
      >
        <SpatialNavigationVirtualizedListWithScroll<T> {...props} ref={ref} />
      </SpatialNavigationNode>
    );
  },
) as <T>(
  props: SpatialNavigationVirtualizedListWithScrollProps<T> & PointerScrollProps & {
    ref?: Ref<SpatialNavigationVirtualizedListRef>;
  },
) => JSX.Element;

