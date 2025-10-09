import type { JSX } from 'preact';
import { forwardRef } from 'preact/compat';
import { useImperativeHandle, useMemo, useRef } from 'preact/hooks';
import {
  type FocusableNodeState,
  SpatialNavigationNode,
  type SpatialNavigationNodeDefaultProps,
} from './SpatialNavigationNode';
import type { SpatialNavigationNodeRef } from '../types';
import { useDeviceType } from '../context/DeviceTypeContext';
import { useSpatialNavigatorFocusableAccessibilityProps } from '../hooks/useSpatialNavigatorFocusableAccessibilityProps';

type FocusableViewProps = {
  style?: JSX.CSSProperties;
  children: JSX.Element | ((props: FocusableNodeState) => JSX.Element);
  viewProps?: JSX.HTMLAttributes<HTMLDivElement> & {
    onMouseEnter?: () => void;
  };
};

type Props = SpatialNavigationNodeDefaultProps & FocusableViewProps;

export const SpatialNavigationFocusableView = forwardRef<SpatialNavigationNodeRef, Props>(
  ({ children, style, viewProps, ...props }, ref) => {
    const { deviceTypeRef } = useDeviceType();
    const nodeRef = useRef<SpatialNavigationNodeRef>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (nodeRef.current && nodeRef.current.focus) {
            nodeRef.current.focus();
          }
        },
      }),
      [nodeRef],
    );

    const webProps = {
      onMouseEnter: () => {
        if (viewProps && viewProps.onMouseEnter) {
          viewProps.onMouseEnter();
        }
        if (deviceTypeRef && typeof deviceTypeRef === 'object' && 'current' in deviceTypeRef && deviceTypeRef.current === 'remotePointer') {
          if (nodeRef.current && nodeRef.current.focus) {
            nodeRef.current.focus();
          }
        }
      },
      onClick: () => {
        if (props.onSelect) {
          props.onSelect();
        }
      },
    };

    return (
      <SpatialNavigationNode isFocusable {...props} ref={nodeRef}>
        {(nodeState: FocusableNodeState) => (
          <InnerFocusableView
            viewProps={viewProps}
            webProps={webProps}
            style={style}
            nodeState={nodeState}
          >
            {children}
          </InnerFocusableView>
        )}
      </SpatialNavigationNode>
    );
  },
);
SpatialNavigationFocusableView.displayName = 'SpatialNavigationFocusableView';

type InnerFocusableViewProps = FocusableViewProps & {
  webProps: {
    onMouseEnter: () => void;
    onClick: () => void;
  };
  nodeState: FocusableNodeState;
};

const InnerFocusableView = forwardRef<HTMLDivElement, InnerFocusableViewProps>(
  ({ viewProps, webProps, children, nodeState, style }, ref) => {
    const accessibilityProps = useSpatialNavigatorFocusableAccessibilityProps();
    const accessibilityState = useMemo(
      () => ({ selected: nodeState.isFocused }),
      [nodeState.isFocused],
    );

    return (
      <div
        ref={ref}
        style={style}
        data-accessibility-state={JSON.stringify(accessibilityState)}
        role={accessibilityProps.role as any}
        aria-label={accessibilityProps['aria-label']}
        {...viewProps}
        {...webProps}
      >
        {typeof children === 'function' ? children(nodeState) : children}
      </div>
    );
  },
);
InnerFocusableView.displayName = 'InnerFocusableView';
