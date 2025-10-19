import type { ComponentChildren, JSX, Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useEffect, useImperativeHandle, useRef, useState } from 'preact/hooks';
import { useSpatialNavigatorDefaultFocus } from '../context/DefaultFocusContext';
import { ParentIdContext, useParentId } from '../context/ParentIdContext';
import { useSpatialNavigatorParentScroll } from '../context/ParentScrollContext';
import { useSpatialNavigator } from '../context/SpatialNavigatorContext';
import { useUniqueId } from '../hooks/useUniqueId';
import type { NodeOrientation, SpatialNavigationNodeRef } from '../types';
import type { NodeIndexRange } from '@bam.tech/lrud';
import { useIsRootActive } from '../context/IsRootActiveContext';
import { cloneElement } from 'preact';

type NonFocusableNodeState = {
  /** Returns whether the root is active or not. An active node is active if one of its children is focused. */
  isActive: boolean;
  /** Returns whether the root is active or not.
   * This is very handy if you want to hide the focus on your page elements when
   * the side-menu is focused (since it is a different root navigator) */
  isRootActive: boolean;
};

export type FocusableNodeState = NonFocusableNodeState & {
  /** Returns whether the root is focused or not. */
  isFocused: boolean;
};

type FocusableProps = {
  isFocusable: true;
  children: (props: FocusableNodeState) => JSX.Element;
};
type NonFocusableProps = {
  isFocusable?: false;
  children: ComponentChildren | ((props: NonFocusableNodeState) => JSX.Element);
};
type DefaultProps = {
  onFocus?: () => void;
  onBlur?: () => void;
  onSelect?: () => void;
  onLongSelect?: () => void;
  onActive?: () => void;
  onInactive?: () => void;
  orientation?: NodeOrientation;
  /** Use this for grid alignment.
   * @see LRUD docs */
  alignInGrid?: boolean;
  indexRange?: NodeIndexRange;
  /**
   * This is an additional offset useful only for the scrollview. It adds up to the offsetFromStart of the scrollview.
   */
  additionalOffset?: number;
};
export type SpatialNavigationNodeProps = DefaultProps & (FocusableProps | NonFocusableProps);

export type SpatialNavigationNodeDefaultProps = DefaultProps;

const useScrollToNodeIfNeeded = ({
  childRef,
  additionalOffset,
}: {
  childRef: Ref<HTMLElement | null>;
  additionalOffset?: number;
}) => {
  const { scrollToNodeIfNeeded } = useSpatialNavigatorParentScroll();
  return () => scrollToNodeIfNeeded(childRef, additionalOffset);
};

const useBindRefToChild = () => {
  const childRef = useRef<HTMLElement | null>(null);

  const bindRefToChild = (child: JSX.Element) => {
    return cloneElement(child, {
      ...child.props,
      ref: (node: HTMLElement) => {
        // We need the reference for our scroll handling
        childRef.current = node;

        // Let's check if a ref was given (not by us)
        const { ref } = child as any;
        if (typeof ref === 'function') {
          ref(node);
        }

        if (ref && typeof ref === 'object' && 'current' in ref) {
          ref.current = node;
        }
      },
    });
  };

  return { bindRefToChild, childRef };
};

export const SpatialNavigationNode = forwardRef<SpatialNavigationNodeRef, SpatialNavigationNodeProps>(
  (
    {
      onFocus,
      onBlur,
      onSelect,
      onLongSelect = onSelect,
      onActive,
      onInactive,
      orientation = 'vertical',
      isFocusable = false,
      alignInGrid = false,
      indexRange,
      children,
      additionalOffset = 0,
    }: SpatialNavigationNodeProps,
    ref,
  ) => {
    const spatialNavigator = useSpatialNavigator();
    const parentId = useParentId();
    const isRootActive = useIsRootActive();
    const [isFocused, setIsFocused] = useState(false);
    const [isActive, setIsActive] = useState(false);
    // If parent changes, we have to re-register the Node + all children -> adding the parentId to the nodeId makes the children re-register.
    const id = useUniqueId({ prefix: `${parentId}_node_` });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => spatialNavigator.grabFocus(id),
      }),
      [spatialNavigator, id],
    );

    const { childRef, bindRefToChild } = useBindRefToChild();

    const scrollToNodeIfNeeded = useScrollToNodeIfNeeded({
      childRef,
      additionalOffset,
    });

    /*
     * We don't re-register in LRUD on each render, because LRUD does not allow updating the nodes.
     * Therefore, the SpatialNavigator Node callbacks are registered at 1st render but can change (ie. if props change) afterwards.
     * Since we want the functions to always be up to date, we use a reference to them.
     */
    const currentOnSelect = useRef<(() => void) | undefined>(undefined);
    currentOnSelect.current = onSelect;

    const currentOnLongSelect = useRef<(() => void) | undefined>(undefined);
    currentOnLongSelect.current = onLongSelect;

    const currentOnFocus = useRef<(() => void) | undefined>(undefined);
    currentOnFocus.current = () => {
      if (onFocus) {
        onFocus();
      }
      scrollToNodeIfNeeded();
    };

    const currentOnBlur = useRef<(() => void) | undefined>(undefined);
    currentOnBlur.current = onBlur;

    const currentOnActive = useRef<(() => void) | undefined>(undefined);
    currentOnActive.current = onActive;

    const currentOnInactive = useRef<(() => void) | undefined>(undefined);
    currentOnInactive.current = onInactive;

    const shouldHaveDefaultFocus = useSpatialNavigatorDefaultFocus();

    // If Proxy is not supported, mark all properties as accessed to ensure re-renders work
    const accessedPropertiesRef = useRef<Set<keyof FocusableNodeState>>(
      typeof Proxy !== 'undefined' 
        ? new Set<keyof FocusableNodeState>() 
        : new Set<keyof FocusableNodeState>(['isFocused', 'isActive', 'isRootActive'])
    );

    useEffect(() => {
      spatialNavigator.registerNode(id, {
        parent: parentId,
        isFocusable,
        onBlur: () => {
          if (currentOnBlur.current) {
            currentOnBlur.current();
          }
          if (accessedPropertiesRef.current.has('isFocused')) {
            setIsFocused(false);
          }
        },
        onFocus: () => {
          if (currentOnFocus.current) {
            currentOnFocus.current();
          }
          if (accessedPropertiesRef.current.has('isFocused')) {
            setIsFocused(true);
          }
        },
        onSelect: () => {
          if (currentOnSelect.current) {
            currentOnSelect.current();
          }
        },
        onLongSelect: () => {
          if (currentOnLongSelect.current) {
            currentOnLongSelect.current();
          }
        },
        orientation,
        isIndexAlign: alignInGrid,
        indexRange,
        onActive: () => {
          if (currentOnActive.current) {
            currentOnActive.current();
          }
          if (accessedPropertiesRef.current.has('isActive')) {
            setIsActive(true);
          }
        },
        onInactive: () => {
          if (currentOnInactive.current) {
            currentOnInactive.current();
          }
          if (accessedPropertiesRef.current.has('isActive')) {
            setIsActive(false);
          }
        },
      });

      return () => spatialNavigator.unregisterNode(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- unfortunately, we can't have clean effects with lrud for now
    }, [parentId]);

    useEffect(() => {
      if (shouldHaveDefaultFocus && isFocusable && !spatialNavigator.hasOneNodeFocused()) {
        spatialNavigator.handleOrQueueDefaultFocus(id);
      }
    }, [id, isFocusable, shouldHaveDefaultFocus, spatialNavigator]);

    // This proxy allows to track whether a property is used or not
    // hence allowing to ignore re-renders for unused properties
    // Fallback for browsers without Proxy support (e.g., Chrome < 49)
    const stateObject = { isFocused, isActive, isRootActive };
    const proxyObject = typeof Proxy !== 'undefined'
      ? new Proxy(stateObject, {
          get(target, prop: keyof FocusableNodeState) {
            accessedPropertiesRef.current.add(prop);
            return target[prop];
          },
        })
      : stateObject; // Fallback: no optimization, but compatible with older browsers

    return (
      <ParentIdContext.Provider value={id}>
        {typeof children === 'function' ? bindRefToChild(children(proxyObject)) : children}
      </ParentIdContext.Provider>
    );
  },
);
SpatialNavigationNode.displayName = 'SpatialNavigationNode';
