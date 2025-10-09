import type { JSX } from 'preact';
import type { NodeOrientation } from '../../../types';

export interface GridRowType<T> {
  items: T[];
  index: number;
}

/**
 * Convert flat array into grid rows
 * @param data - Flat array of items
 * @param numberOfColumns - Number of columns per row
 * @param header - Optional header element
 * @returns Array of grid rows
 */
export const convertToGrid = <T>(
  data: T[],
  numberOfColumns: number,
  header?: JSX.Element,
): GridRowType<T>[] => {
  // Chunk the data into rows
  const rows: T[][] = [];
  for (let i = 0; i < data.length; i += numberOfColumns) {
    rows.push(data.slice(i, i + numberOfColumns));
  }

  return rows.map((items, index) => {
    // We do this to have index taking into account the header
    const computedIndex = header ? index + 1 : index;
    return { items, index: computedIndex };
  });
};

export const invertOrientation = (orientation: NodeOrientation): NodeOrientation =>
  orientation === 'vertical' ? 'horizontal' : 'vertical';

