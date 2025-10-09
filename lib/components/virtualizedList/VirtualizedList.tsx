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
    (item: T, index: number) =>
      typeof itemSize === 'number'
        ? index * itemSize
        : data.slice(0, index).reduce((acc, item) => acc + itemSize(item), 0),
    [data, itemSize],
  );

  const style = useMemo<JSX.CSSProperties>(() => {
    const offset = computeOffset(item, index);
    return {
      left: 0,
      position: 'absolute',
      transform: vertical ? `translateY(${offset}px)` : `translateX(${offset}px)`,
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

  useOnEndReached({
    numberOfItems: data.length,
    range,
    currentlyFocusedItemIndex,
    onEndReachedThresholdItemsNumber,
    onEndReached,
  });

  // Web animation using CSS transitions
  const newTranslationValue = allScrollOffsets[currentlyFocusedItemIndex];
  const animatedStyle = useMemo<JSX.CSSProperties>(() => ({
    transitionDuration: `${scrollDuration}ms`,
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-out',
    transform: vertical ? `translateY(${newTranslationValue}px)` : `translateX(${newTranslationValue}px)`,
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

  const directionStyle = useMemo<JSX.CSSProperties>(
    () => ({ flexDirection: vertical ? 'column' : ('row' as const) }),
    [vertical],
  );

  /**
   * If the view has the size of the screen, then it is dropped in the component hierarchy when scrolled for more than the screen size (scroll right).
   * To ensure that the view stays visible, we adapt its size to the size of the virtualized list.
   */
  const dimensionStyle = useMemo<JSX.CSSProperties>(
    () =>
      vertical
        ? {
            height: `${totalVirtualizedListSize}px`,
          }
        : { width: `${totalVirtualizedListSize}px` },
    [totalVirtualizedListSize, vertical],
  );

  const containerStyle = useMemo<JSX.CSSProperties>(() => ({
    ...style,
    ...animatedStyle,
    ...directionStyle,
    ...dimensionStyle,
    flex: 1,
  }), [style, animatedStyle, directionStyle, dimensionStyle]);

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

