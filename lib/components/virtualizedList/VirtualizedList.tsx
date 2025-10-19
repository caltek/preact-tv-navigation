import { useCallback, useEffect, useMemo } from 'preact/hooks';
import type { JSX } from 'preact';
import { getRange } from './helpers/getRange';
import type { NodeOrientation } from '../../types';
import { getSizeInPxFromOneItemToAnother } from './helpers/getSizeInPxFromOneItemToAnother';
import { computeAllScrollOffsets } from './helpers/createScrollOffsetArray';
import { getNumberOfItemsVisibleOnScreen } from './helpers/getNumberOfItemsVisibleOnScreen';
import { getAdditionalNumberOfItemsRendered } from './helpers/getAdditionalNumberOfItemsRendered';
import type { ScrollBehavior } from './types';

export interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (args: { item: T; index: number }) => JSX.Element;
  /** If vertical the height of an item, otherwise the width */
  itemSize: number | ((item: T) => number);
  currentlyFocusedItemIndex: number;
  /**
   * How many items are RENDERED ADDITIONALLY to the minimum amount possible. It impacts virtualization size.
   * Defaults to 2.
   *
   * Should be a POSITIVE number.
   *
   * Minimal amount possible is 2N + 1 for jump-on-scroll, and N + 2 for the other behaviours, N being the number
   * of visible elements on the screen.
   *
   * By default, you will then have N + 2 + 2 elements rendered for stick-to-* behaviours.
   */
  additionalItemsRendered?: number;
  onEndReached?: () => void;
  /** Number of items left to display before triggering onEndReached */
  onEndReachedThresholdItemsNumber?: number;
  style?: JSX.CSSProperties;
  orientation?: NodeOrientation;
  /**
   * @deprecated
   * Use a custom key instead of the recycling.
   * */
  keyExtractor?: (index: number) => string;
  /** Total number of expected items for infinite scroll (helps aligning items) used for pagination */
  nbMaxOfItems?: number;
  /** Duration of a scrolling animation inside the VirtualizedList */
  scrollDuration?: number;
  /** The size of the list in its scrollable axis */
  listSizeInPx: number;
  scrollBehavior?: ScrollBehavior;
  testID?: string;
}

const useOnEndReached = ({
  numberOfItems,
  range,
  currentlyFocusedItemIndex,
  onEndReachedThresholdItemsNumber,
  onEndReached,
}: {
  numberOfItems: number;
  range: { start: number; end: number };
  currentlyFocusedItemIndex: number;
  onEndReachedThresholdItemsNumber: number;
  onEndReached: (() => void) | undefined;
}) => {
  useEffect(() => {
    if (numberOfItems === 0 || range.end === 0) {
      return;
    }

    if (
      currentlyFocusedItemIndex >= Math.max(numberOfItems - 1 - onEndReachedThresholdItemsNumber, 0)
    ) {
      if (onEndReached) {
        onEndReached();
      }
    }
  }, [
    onEndReached,
    range.end,
    currentlyFocusedItemIndex,
    onEndReachedThresholdItemsNumber,
    numberOfItems,
  ]);
};

function ItemContainerWithAnimatedStyle<T>({
  item,
  index,
  renderItem,
  itemSize,
  vertical,
  data,
}: {
  item: T;
  index: number;
  renderItem: VirtualizedListProps<T>['renderItem'];
  itemSize: number | ((item: T) => number);
  vertical: boolean;
  data: T[];
}) {
  const computeOffset = useCallback(
    (_item: T, index: number) =>
      typeof itemSize === 'number'
        ? index * itemSize
        : data.slice(0, index).reduce((acc, item) => acc + itemSize(item), 0),
    [data, itemSize],
  );

  const style = useMemo<JSX.CSSProperties>(() => {
    const offset = computeOffset(item, index);
    return {
      position: 'absolute',
      left: vertical ? 0 : offset,
      top: vertical ? offset : 0,
      // Chrome 38 specific fixes
      WebkitTransform: 'translateZ(0)', // Force hardware acceleration
      transform: 'translateZ(0)',
      // Ensure proper rendering
      WebkitBackfaceVisibility: 'hidden',
      backfaceVisibility: 'hidden',
    };
  }, [computeOffset, item, index, vertical]);

  return <div style={style}>{renderItem({ item, index })}</div>;
}

/**
 * DO NOT use this component directly !
 * You should use the component SpatialNavigationVirtualizedList.tsx to render navigable lists of components.
 *
 * Why this has been made:
 *   - it gives us full control on the way we scroll (using CSS animations)
 *   - it is way more performant than rendering all items
 */
export function VirtualizedList<T>({
  data,
  renderItem,
  itemSize,
  currentlyFocusedItemIndex,
  additionalItemsRendered = 2,
  onEndReached,
  onEndReachedThresholdItemsNumber = 3,
  style,
  orientation = 'horizontal',
  nbMaxOfItems,
  keyExtractor,
  scrollDuration = 200,
  listSizeInPx,
  scrollBehavior = 'stick-to-start',
  testID,
}: VirtualizedListProps<T>) {
  console.log('🎯 VirtualizedList: Component render', {
    dataLength: data.length,
    currentlyFocusedItemIndex,
    orientation,
    listSizeInPx,
    scrollBehavior,
    itemSize: typeof itemSize === 'number' ? itemSize : 'function',
  });

  const numberOfItemsVisibleOnScreen = getNumberOfItemsVisibleOnScreen({
    data,
    listSizeInPx,
    itemSize,
  });

  const numberOfItemsToRender = getAdditionalNumberOfItemsRendered(
    scrollBehavior,
    numberOfItemsVisibleOnScreen,
    additionalItemsRendered,
  );

  const range = getRange({
    data,
    currentlyFocusedItemIndex,
    numberOfRenderedItems: numberOfItemsToRender,
    numberOfItemsVisibleOnScreen,
    scrollBehavior,
  });

  const vertical = orientation === 'vertical';

  const totalVirtualizedListSize = useMemo(
    () => getSizeInPxFromOneItemToAnother(data, itemSize, 0, data.length),
    [data, itemSize],
  );

  const dataSliceToRender = data.slice(range.start, range.end + 1);

  const allScrollOffsets = useMemo(
    () =>
      computeAllScrollOffsets({
        itemSize: itemSize,
        nbMaxOfItems: nbMaxOfItems !== undefined ? nbMaxOfItems : data.length,
        numberOfItemsVisibleOnScreen: numberOfItemsVisibleOnScreen,
        scrollBehavior: scrollBehavior,
        data: data,
        listSizeInPx: listSizeInPx,
      }),
    [data, itemSize, listSizeInPx, nbMaxOfItems, numberOfItemsVisibleOnScreen, scrollBehavior],
  );

  console.log('📊 VirtualizedList: Calculations', {
    numberOfItemsVisibleOnScreen,
    numberOfItemsToRender,
    range: { start: range.start, end: range.end },
    totalVirtualizedListSize,
    dataSliceLength: dataSliceToRender.length,
    allScrollOffsetsLength: allScrollOffsets.length,
    currentOffset: allScrollOffsets[currentlyFocusedItemIndex],
  });

  useOnEndReached({
    numberOfItems: data.length,
    range,
    currentlyFocusedItemIndex,
    onEndReachedThresholdItemsNumber,
    onEndReached,
  });

  // Web animation using CSS transitions with top/left positioning for legacy browser compatibility
  const newTranslationValue = allScrollOffsets[currentlyFocusedItemIndex];
  const animatedStyle = useMemo<JSX.CSSProperties>(() => ({
    // Chrome 38 compatible transitions
    WebkitTransitionDuration: `${scrollDuration}ms`,
    transitionDuration: `${scrollDuration}ms`,
    WebkitTransitionProperty: vertical ? 'top' : 'left',
    transitionProperty: vertical ? 'top' : 'left',
    WebkitTransitionTimingFunction: 'ease-out',
    transitionTimingFunction: 'ease-out',
    // Position properties
    left: vertical ? 0 : newTranslationValue,
    top: vertical ? newTranslationValue : 0,
    // Chrome 38 specific fixes
    WebkitTransform: 'translateZ(0)', // Force hardware acceleration
    transform: 'translateZ(0)',
  }), [newTranslationValue, scrollDuration, vertical]);

  /*
   * Use the actual index as the key to avoid duplicate key issues.
   * While recycling would be a performance optimization, it causes key collisions
   * when the range changes during scrolling.
   */
  const defaultKeyExtractor = useCallback(
    (index: number) => `item_${index}`,
    [],
  );

  // Legacy browser compatibility: use relative positioning instead of flex for absolute child positioning
  const directionStyle = useMemo<JSX.CSSProperties>(
    () => ({ 
      position: 'relative',
      width: vertical ? '100%' : `${totalVirtualizedListSize}px`,
      height: vertical ? `${totalVirtualizedListSize}px` : '100%',
      // Chrome 38 specific fixes
      WebkitTransform: 'translateZ(0)', // Force hardware acceleration
      transform: 'translateZ(0)',
      // Ensure proper overflow handling
      overflow: 'hidden',
    }),
    [vertical, totalVirtualizedListSize],
  );

  // Dimension style is now handled in directionStyle for legacy browser compatibility

  const containerStyle = useMemo<JSX.CSSProperties>(() => ({
    ...style,
    ...animatedStyle,
    ...directionStyle,
    flex: 1,
  }), [style, animatedStyle, directionStyle]);

  return (
    <div
      style={containerStyle}
      data-testid={testID}
    >
      <div>
        {dataSliceToRender.map((item, virtualIndex) => {
          const index = range.start + virtualIndex;
          return (
            <ItemContainerWithAnimatedStyle<T>
              key={keyExtractor ? keyExtractor(index) : defaultKeyExtractor(index)}
              renderItem={renderItem}
              item={item}
              index={index}
              itemSize={itemSize}
              vertical={vertical}
              data={data}
            />
          );
        })}
      </div>
    </div>
  );
}

