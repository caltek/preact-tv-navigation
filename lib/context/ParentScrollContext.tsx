import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Ref } from 'preact';

export type ScrollToNodeCallback = (childRef: Ref<HTMLElement | null>, additionalOffset?: number) => void;

const defaultScrollToNodeIfNeeded: ScrollToNodeCallback = () => {
  // Default no-op implementation
};

export const ParentScrollContext = createContext<ScrollToNodeCallback>(defaultScrollToNodeIfNeeded);

// Alias for compatibility
export const SpatialNavigatorParentScrollContext = ParentScrollContext;

export const useSpatialNavigatorParentScroll = () => {
  const scrollToNodeIfNeeded = useContext(ParentScrollContext);
  return { scrollToNodeIfNeeded };
};

