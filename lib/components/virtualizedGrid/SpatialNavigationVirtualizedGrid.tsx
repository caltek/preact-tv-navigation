import type { JSX, ComponentChildren, Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { SpatialNavigationVirtualizedList } from '../virtualizedList/SpatialNavigationVirtualizedList';
import type {
  PointerScrollProps,
  SpatialNavigationVirtualizedListWithScrollProps,
} from '../virtualizedList/SpatialNavigationVirtualizedListWithScroll';
import { useSpatialNavigator } from '../../context/SpatialNavigatorContext';
import { ParentIdContext, useParentId } from '../../context/ParentIdContext';
import { convertToGrid, type GridRowType } from './helpers/convertToGrid';
import type { ViewportPadding } from '../virtualizedList/VirtualizedListWithSize';

type SpatialNavigationVirtualizedGridProps<T> = Pick<
  SpatialNavigationVirtualizedListWithScrollProps<T>,
  | 'data'
  | 'renderItem'
  | 'onEndReached'
  | 'style'
  | 'nbMaxOfItems'
  | 'scrollBehavior'
  | 'scrollDuration'
  | 'testID'
> &
  PointerScrollProps & {
    itemHeight: number;
    header?: JSX.Element;
    headerSize?: number;
    /** How many rows are RENDERED ADDITIONALLY to those already visible (impacts virtualization size) */
    additionalRenderedRows?: number;
    /** Number of rows left to display before triggering onEndReached */
    onEndReachedThresholdRowsNumber?: number;
    /** Number of columns in the grid OR number of items per rows */
    numberOfColumns: number;
    /** Used to modify every row style */
    rowContainerStyle?: JSX.CSSProperties;
    /** Viewport padding used for Chrome 38 fallback size calculation */
    viewportPadding?: ViewportPadding;
  };

export interface SpatialNavigationVirtualizedGridRef {
  focus: (index: number) => void;
  scrollTo: (index: number) => void;
  currentlyFocusedItemIndex: number;
}

const useRegisterGridRowVirtualNodes = ({ numberOfColumns }: { numberOfColumns: number }) => {
  const spatialNavigator = useSpatialNavigator();
  const parentId = useParentId();

  const getNthVirtualNodeID = useCallback((index: number) => `${parentId}_${index}`, [parentId]);

  // This function must be idempotent so we don't register existing nodes again when grid data changes
  const registerNthVirtualNode = useCallback(
    (index: number) => {
      return spatialNavigator.registerNode(getNthVirtualNodeID(index), {
        parent: parentId,
        orientation: 'horizontal',
        isFocusable: false,
      });
    },
    [spatialNavigator, parentId, getNthVirtualNodeID],
  );

  const unregisterNthVirtualNode = useCallback(
    (index: number) => {
      return spatialNavigator.unregisterNode(getNthVirtualNodeID(index));
    },
    [spatialNavigator, getNthVirtualNodeID],
  );

  useEffect(() => {
    // Register virtual nodes for each column
    for (let i = 0; i < numberOfColumns; i++) {
      registerNthVirtualNode(i);
    }
    return () => {
      for (let i = 0; i < numberOfColumns; i++) {
        unregisterNthVirtualNode(i);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unfortunately, we can't have clean effects with lrud for now
  }, [parentId]);

  return { getNthVirtualNodeID };
};

function ItemWrapperWithVirtualParentContext<T>({
  virtualParentID,
  item,
  index,
  renderItem,
}: {
  virtualParentID: string;
  item: T;
  index: number;
  renderItem: (args: { item: T; index: number }) => JSX.Element;
}) {
  return (
    <ParentIdContext.Provider value={virtualParentID}>
      {renderItem({ item, index })}
    </ParentIdContext.Provider>
  );
}

function GridRow<T>({
  renderItem,
  numberOfColumns,
  row,
  rowIndex,
  rowContainerStyle,
}: {
  renderItem: (args: { item: T; index: number }) => JSX.Element;
  numberOfColumns: number;
  row: GridRowType<T>;
  rowIndex: number;
  rowContainerStyle?: JSX.CSSProperties;
}) {
  const { getNthVirtualNodeID } = useRegisterGridRowVirtualNodes({ numberOfColumns });

  return (
    <HorizontalContainer style={rowContainerStyle}>
      {row.items.map((item, columnIndex) => {
        const itemIndex = rowIndex * numberOfColumns + columnIndex;
        return (
          /* This div is important to reset flex direction to vertical */
          <div key={columnIndex}>
            <ItemWrapperWithVirtualParentContext
              virtualParentID={getNthVirtualNodeID(columnIndex)}
              renderItem={renderItem}
              item={item}
              index={itemIndex}
            />
          </div>
        );
      })}
    </HorizontalContainer>
  );
}

/**
 * Use this component to render spatially navigable grids of items.
 * Grids only support vertical orientation (vertically scrollable),
 * but you can navigate between elements in any direction.
 *
 * A grid is a series of horizontal rows rendering 'numberOfColumns' items.
 */
export const SpatialNavigationVirtualizedGrid = forwardRef(
  <T,>(
    {
      renderItem,
      data,
      numberOfColumns,
      itemHeight,
      header,
      headerSize,
      additionalRenderedRows,
      onEndReachedThresholdRowsNumber,
      nbMaxOfItems,
      rowContainerStyle,
      ...props
    }: SpatialNavigationVirtualizedGridProps<T>,
    ref: Ref<SpatialNavigationVirtualizedGridRef>,
  ) => {
    if (header && !headerSize)
      throw new Error('You must provide a headerSize when using a header');
    if (headerSize && !header)
      throw new Error('You must provide a header when using a headerSize');
    const hasHeader = !!header && !!headerSize;

    const gridRows = useMemo(
      () => convertToGrid(data, numberOfColumns, header),
      [data, header, numberOfColumns],
    );
    const gridRowsWithHeaderIfProvided = useMemo(
      () => (hasHeader ? [header, ...gridRows] : gridRows),
      [hasHeader, header, gridRows],
    );

    const itemSizeAsAFunction = useCallback(
      (item: GridRowType<T> | JSX.Element) => {
        if (hasHeader && typeof item === 'object' && 'type' in item) {
          return headerSize;
        }
        return itemHeight;
      },
      [hasHeader, headerSize, itemHeight],
    );

    const itemSize = hasHeader ? itemSizeAsAFunction : itemHeight;

    const renderRow = useCallback(
      ({ item: row, index }: { item: GridRowType<T>; index: number }) => (
        <GridRow
          renderItem={renderItem}
          numberOfColumns={numberOfColumns}
          row={row}
          rowIndex={index}
          rowContainerStyle={rowContainerStyle}
        />
      ),
      [renderItem, numberOfColumns, rowContainerStyle],
    );
    
    const renderHeaderThenRows = useCallback(
      ({ item, index }: { item: GridRowType<T> | JSX.Element; index: number }) => {
        if (typeof item === 'object' && 'type' in item) {
          return item;
        }
        // We do this to have index taking into account the header
        const computedIndex = hasHeader ? index - 1 : index;
        return renderRow({ item: item as GridRowType<T>, index: computedIndex });
      },
      [hasHeader, renderRow],
    );

    return (
      <SpatialNavigationVirtualizedList
        ref={ref as any}
        data={gridRowsWithHeaderIfProvided}
        itemSize={itemSize}
        additionalItemsRendered={additionalRenderedRows}
        onEndReachedThresholdItemsNumber={onEndReachedThresholdRowsNumber}
        orientation="vertical"
        nbMaxOfItems={nbMaxOfItems ? Math.ceil(nbMaxOfItems / numberOfColumns) : undefined}
        renderItem={renderHeaderThenRows}
        isGrid
        {...props}
      />
    );
  },
) as <T>(
  props: SpatialNavigationVirtualizedGridProps<T> & {
    ref?: Ref<SpatialNavigationVirtualizedGridRef>;
  },
) => JSX.Element;

type HorizontalContainerProps = {
  style?: JSX.CSSProperties;
  children: ComponentChildren;
};

const HorizontalContainer = ({ style, children }: HorizontalContainerProps) => {
  return (
    <div style={{ ...style, display: 'flex', flexDirection: 'row' }}>
      {children}
    </div>
  );
};

