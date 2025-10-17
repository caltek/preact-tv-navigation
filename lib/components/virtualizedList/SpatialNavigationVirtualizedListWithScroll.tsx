import type { JSX, Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'preact/hooks';
import type { VirtualizedListProps } from './VirtualizedList';
import {
  SpatialNavigationVirtualizedListWithVirtualNodes,
  type SpatialNavigationVirtualizedListWithVirtualNodesProps,
  type SpatialNavigationVirtualizedListWithVirtualNodesRef,
} from './SpatialNavigationVirtualizedListWithVirtualNodes';
import {
  type ScrollToNodeCallback,
  ParentScrollContext as SpatialNavigatorParentScrollContext,
  useSpatialNavigatorParentScroll,
} from '../../context/ParentScrollContext';
import { useDeviceType } from '../../context/DeviceTypeContext';
import { useSpatialNavigator } from '../../context/SpatialNavigatorContext';

function ItemWrapperWithScrollContext<T>({
  setCurrentlyFocusedItemIndex,
  item,
  index,
  renderItem,
}: {
  setCurrentlyFocusedItemIndex: (i: number) => void;
  item: T;
  index: number;
  renderItem: VirtualizedListProps<T>['renderItem'];
}) {
  const { scrollToNodeIfNeeded: makeParentsScrollToNodeIfNeeded } =
    useSpatialNavigatorParentScroll();

  const scrollToItem: ScrollToNodeCallback = useCallback(
    (newlyFocusedElementRef, additionalOffset) => {
      setCurrentlyFocusedItemIndex(index);
      // We need to propagate the scroll event for parents if we have nested ScrollViews/VirtualizedLists.
      makeParentsScrollToNodeIfNeeded(newlyFocusedElementRef, additionalOffset);
    },
    [makeParentsScrollToNodeIfNeeded, setCurrentlyFocusedItemIndex, index],
  );

  return (
    <SpatialNavigatorParentScrollContext.Provider value={scrollToItem}>
      {renderItem({ item, index })}
    </SpatialNavigatorParentScrollContext.Provider>
  );
}

export type SpatialNavigationVirtualizedListWithScrollProps<T> = Omit<
  SpatialNavigationVirtualizedListWithVirtualNodesProps<T>,
  'currentlyFocusedItemIndex'
>;

export type PointerScrollProps = {
  descendingArrow?: JSX.Element;
  descendingArrowContainerStyle?: JSX.CSSProperties;
  ascendingArrow?: JSX.Element;
  ascendingArrowContainerStyle?: JSX.CSSProperties;
  scrollInterval?: number;
};

export interface SpatialNavigationVirtualizedListRef {
  focus: (index: number) => void;
  scrollTo: (index: number) => void;
  currentlyFocusedItemIndex: number;
}

const useRemotePointerVirtualizedListScrollProps = <T,>({
  setCurrentlyFocusedItemIndex,
  scrollInterval,
  data,
  idRef,
}: {
  setCurrentlyFocusedItemIndex: (value: number | ((prev: number) => number)) => void;
  scrollInterval: number;
  data: T[];
  idRef: Ref<SpatialNavigationVirtualizedListWithVirtualNodesRef>;
}) => {
  const { deviceType, deviceTypeRef, setScrollingIntervalId: setScrollingId } = useDeviceType();
  const navigator = useSpatialNavigator();
  const grabFocus = navigator.grabFocus;

  const onMouseEnterDescending = useCallback(() => {
    const callback = () => {
      setCurrentlyFocusedItemIndex((index: number) => {
        if (index > 0) {
          if (idRef && typeof idRef === 'object' && 'current' in idRef && idRef.current) {
            grabFocus(idRef.current.getNthVirtualNodeID(index - 1));
          }
          return index - 1;
        } else {
          return index;
        }
      });
    };

    const id = setInterval(() => {
      callback();
    }, scrollInterval);
    setScrollingId(id);
  }, [grabFocus, scrollInterval, setCurrentlyFocusedItemIndex, setScrollingId, idRef]);

  const onMouseLeave = useCallback(() => {
    setScrollingId(null);
  }, [setScrollingId]);

  const onMouseEnterAscending = useCallback(() => {
    const callback = () => {
      setCurrentlyFocusedItemIndex((index: number) => {
        if (index < data.length - 1) {
          if (idRef && typeof idRef === 'object' && 'current' in idRef && idRef.current) {
            grabFocus(idRef.current.getNthVirtualNodeID(index + 1));
          }
          return index + 1;
        } else {
          return index;
        }
      });
    };
    const id = setInterval(() => {
      callback();
    }, scrollInterval);
    setScrollingId(id);
  }, [data.length, grabFocus, scrollInterval, setCurrentlyFocusedItemIndex, setScrollingId, idRef]);

  const descendingArrowProps = useMemo(
    () => ({
      onMouseEnter: onMouseEnterDescending,
      onMouseLeave: onMouseLeave,
    }),
    [onMouseEnterDescending, onMouseLeave],
  );

  const ascendingArrowProps = useMemo(
    () => ({
      onMouseEnter: onMouseEnterAscending,
      onMouseLeave: onMouseLeave,
    }),
    [onMouseEnterAscending, onMouseLeave],
  );

  return {
    descendingArrowProps,
    ascendingArrowProps,
    deviceType,
    deviceTypeRef,
  };
};

/**
 * This component wraps every item of a virtualizedList in a scroll handling context.
 */
export const SpatialNavigationVirtualizedListWithScroll = forwardRef(
  <T,>(
    props: SpatialNavigationVirtualizedListWithScrollProps<T> & PointerScrollProps,
    ref: Ref<SpatialNavigationVirtualizedListRef>,
  ) => {
    const {
      data,
      renderItem,
      descendingArrow,
      ascendingArrow,
      descendingArrowContainerStyle,
      ascendingArrowContainerStyle,
      scrollInterval = 100,
    } = props;
    const [currentlyFocusedItemIndex, setCurrentlyFocusedItemIndex] = useState(0);
    const spatialNavigator = useSpatialNavigator();
    const idRef = useRef<SpatialNavigationVirtualizedListWithVirtualNodesRef>(null);
    
    const { deviceType, descendingArrowProps, ascendingArrowProps } =
      useRemotePointerVirtualizedListScrollProps({
        setCurrentlyFocusedItemIndex,
        scrollInterval,
        data,
        idRef,
      });

    const { deviceTypeRef } = useDeviceType();

    const setCurrentlyFocusedItemIndexCallback = useCallback(
      (index: number) => {
        // Always update for keyboard/remote navigation, skip for remotePointer (mouse hover)
        if (deviceTypeRef && typeof deviceTypeRef === 'object' && 'current' in deviceTypeRef) {
          if (deviceTypeRef.current !== 'remotePointer') {
            setCurrentlyFocusedItemIndex(index);
          }
        } else {
          // Fallback: always update if deviceTypeRef is not available
          setCurrentlyFocusedItemIndex(index);
        }
      },
      [deviceTypeRef],
    );

    const scrollTo = useCallback(
      (index: number) => {
        if (idRef.current) {
          const newId = idRef.current.getNthVirtualNodeID(index);
          spatialNavigator.grabFocusDeferred(newId);
        }
      },
      [idRef, spatialNavigator],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: (index: number) => {
          setCurrentlyFocusedItemIndex(index);
          scrollTo(index);
        },
        scrollTo,
        currentlyFocusedItemIndex,
      }),
      [currentlyFocusedItemIndex, scrollTo],
    );

    const renderWrappedItem: typeof props.renderItem = useCallback(
      ({ item, index }) => (
        <ItemWrapperWithScrollContext
          setCurrentlyFocusedItemIndex={setCurrentlyFocusedItemIndexCallback}
          renderItem={renderItem}
          item={item}
          index={index}
        />
      ),
      [setCurrentlyFocusedItemIndexCallback, renderItem],
    );

    return (
      <>
        <SpatialNavigationVirtualizedListWithVirtualNodes
          {...props}
          getNodeIdRef={idRef}
          currentlyFocusedItemIndex={currentlyFocusedItemIndex}
          renderItem={renderWrappedItem}
        />
        {deviceType === 'remotePointer' ? (
          <PointerScrollArrows
            descendingArrowContainerStyle={descendingArrowContainerStyle}
            descendingArrowProps={descendingArrowProps}
            descendingArrow={descendingArrow}
            ascendingArrowContainerStyle={ascendingArrowContainerStyle}
            ascendingArrowProps={ascendingArrowProps}
            ascendingArrow={ascendingArrow}
          />
        ) : undefined}
      </>
    );
  },
) as <T>(
  props: SpatialNavigationVirtualizedListWithScrollProps<T> & PointerScrollProps & {
    ref?: Ref<SpatialNavigationVirtualizedListRef>;
  },
) => JSX.Element;

function PointerScrollArrows({
  ascendingArrow,
  ascendingArrowProps,
  ascendingArrowContainerStyle,
  descendingArrow,
  descendingArrowProps,
  descendingArrowContainerStyle,
}: PointerScrollProps & {
  descendingArrowProps?: { onMouseEnter: () => void; onMouseLeave: () => void };
  ascendingArrowProps?: { onMouseEnter: () => void; onMouseLeave: () => void };
}) {
  return (
    <>
      <div style={descendingArrowContainerStyle} {...descendingArrowProps}>
        {descendingArrow}
      </div>
      <div style={ascendingArrowContainerStyle} {...ascendingArrowProps}>
        {ascendingArrow}
      </div>
    </>
  );
}

