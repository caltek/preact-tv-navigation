import type { ScrollBehavior } from '../types';
import { getSizeInPxFromOneItemToAnother } from './getSizeInPxFromOneItemToAnother';

const computeStickToStartTranslation = <T>({
  currentlyFocusedItemIndex,
  itemSizeInPx,
  data,
  maxPossibleLeftAlignedIndex,
}: {
  currentlyFocusedItemIndex: number;
  itemSizeInPx: number | ((item: T) => number);
  data: T[];
  maxPossibleLeftAlignedIndex: number;
}) => {
  const scrollOffset =
    currentlyFocusedItemIndex < maxPossibleLeftAlignedIndex
      ? getSizeInPxFromOneItemToAnother(data, itemSizeInPx, 0, currentlyFocusedItemIndex)
      : getSizeInPxFromOneItemToAnother(data, itemSizeInPx, 0, maxPossibleLeftAlignedIndex);
  return -scrollOffset;
};

const computeStickToEndTranslation = <T>({
  currentlyFocusedItemIndex,
  itemSizeInPx,
  data,
  listSizeInPx,
  maxPossibleRightAlignedIndex,
}: {
  currentlyFocusedItemIndex: number;
  itemSizeInPx: number | ((item: T) => number);
  data: T[];
  listSizeInPx: number;
  maxPossibleRightAlignedIndex: number;
}) => {
  if (currentlyFocusedItemIndex <= maxPossibleRightAlignedIndex) return -0;

  const currentlyFocusedItemSize =
    typeof itemSizeInPx === 'function'
      ? itemSizeInPx(data[currentlyFocusedItemIndex])
      : itemSizeInPx;

  const sizeOfListFromStartToCurrentlyFocusedItem = getSizeInPxFromOneItemToAnother(
    data,
    itemSizeInPx,
    0,
    currentlyFocusedItemIndex,
  );

  const scrollOffset =
    sizeOfListFromStartToCurrentlyFocusedItem + currentlyFocusedItemSize - listSizeInPx;
  return -scrollOffset;
};

const computeJumpOnScrollTranslation = <T>({
  currentlyFocusedItemIndex,
  itemSizeInPx,
  nbMaxOfItems,
  numberOfItemsVisibleOnScreen,
}: {
  currentlyFocusedItemIndex: number;
  itemSizeInPx: number | ((item: T) => number);
  nbMaxOfItems: number;
  numberOfItemsVisibleOnScreen: number;
}) => {
  if (typeof itemSizeInPx === 'function')
    throw new Error('jump-on-scroll scroll behavior is not supported with dynamic item size');

  const maxPossibleLeftAlignedIndex = Math.max(nbMaxOfItems - numberOfItemsVisibleOnScreen, 0);
  const indexOfItemToFocus =
    currentlyFocusedItemIndex - (currentlyFocusedItemIndex % numberOfItemsVisibleOnScreen);
  const leftAlignedIndex = Math.min(indexOfItemToFocus, maxPossibleLeftAlignedIndex);
  const scrollOffset = leftAlignedIndex * itemSizeInPx;
  return -scrollOffset;
};

const computeCenterTranslation = <T>({
  currentlyFocusedItemIndex,
  itemSizeInPx,
  data,
  listSizeInPx,
  numberOfItemsVisibleOnScreen,
  maxPossibleLeftAlignedIndex,
  maxPossibleRightAlignedIndex,
}: {
  currentlyFocusedItemIndex: number;
  itemSizeInPx: number | ((item: T) => number);
  data: T[];
  listSizeInPx: number;
  numberOfItemsVisibleOnScreen: number;
  maxPossibleLeftAlignedIndex: number;
  maxPossibleRightAlignedIndex: number;
}) => {
  const centerThreshold = Math.floor(numberOfItemsVisibleOnScreen / 2);
  
  // At the beginning - don't scroll until we reach the middle of the viewport
  if (currentlyFocusedItemIndex < centerThreshold) {
    return 0; // No scroll - items move freely from top
  }

  // At the end of the list, use stick-to-end
  if (currentlyFocusedItemIndex >= data.length - centerThreshold) {
    return computeStickToEndTranslation({
      currentlyFocusedItemIndex,
      itemSizeInPx,
      data,
      listSizeInPx,
      maxPossibleRightAlignedIndex,
    });
  }

  // In the middle, keep item centered
  const currentItemSize = typeof itemSizeInPx === 'function'
    ? itemSizeInPx(data[currentlyFocusedItemIndex])
    : itemSizeInPx;
  
  const itemOffset = getSizeInPxFromOneItemToAnother(data, itemSizeInPx, 0, currentlyFocusedItemIndex);
  const centerOffset = (listSizeInPx - currentItemSize) / 2;
  
  return -(itemOffset - centerOffset);
};

export const computeTranslation = <T>({
  currentlyFocusedItemIndex,
  itemSizeInPx,
  nbMaxOfItems,
  numberOfItemsVisibleOnScreen,
  scrollBehavior,
  data,
  listSizeInPx,
  maxPossibleLeftAlignedIndex,
  maxPossibleRightAlignedIndex,
}: {
  currentlyFocusedItemIndex: number;
  itemSizeInPx: number | ((item: T) => number);
  nbMaxOfItems: number;
  numberOfItemsVisibleOnScreen: number;
  scrollBehavior: ScrollBehavior;
  data: T[];
  listSizeInPx: number;
  maxPossibleLeftAlignedIndex: number;
  maxPossibleRightAlignedIndex: number;
}) => {
  switch (scrollBehavior) {
    case 'stick-to-start':
      return computeStickToStartTranslation({
        currentlyFocusedItemIndex,
        itemSizeInPx,
        data,
        maxPossibleLeftAlignedIndex,
      });
    case 'stick-to-end':
      return computeStickToEndTranslation({
        currentlyFocusedItemIndex,
        itemSizeInPx,
        data,
        listSizeInPx,
        maxPossibleRightAlignedIndex,
      });
    case 'jump-on-scroll':
      return computeJumpOnScrollTranslation({
        currentlyFocusedItemIndex,
        itemSizeInPx,
        nbMaxOfItems,
        numberOfItemsVisibleOnScreen,
      });
    case 'center':
      return computeCenterTranslation({
        currentlyFocusedItemIndex,
        itemSizeInPx,
        data,
        listSizeInPx,
        numberOfItemsVisibleOnScreen,
        maxPossibleLeftAlignedIndex,
        maxPossibleRightAlignedIndex,
      });
    default:
      throw new Error(`Invalid scroll behavior: ${scrollBehavior}`);
  }
};

