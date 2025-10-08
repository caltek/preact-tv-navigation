/**
 * Preact Spatial Navigation Library
 * 
 * A reusable library for TV-style spatial navigation in Preact applications,
 * powered by js-spatial-navigation.
 */

// Root Component (new API)
export {
  SpatialNavigationRoot,
  SpatialNavigationProvider, // Legacy name for backward compatibility
  useSpatialNavigationContext,
} from './components/SpatialNavigationRoot';

// Core Navigation Components (new API)
export { SpatialNavigationNode } from './components/SpatialNavigationNode';
export { SpatialNavigationView } from './components/SpatialNavigationView';
export { SpatialNavigationFocusableView } from './components/SpatialNavigationFocusableView';
export { SpatialNavigationScrollView } from './components/SpatialNavigationScrollView';
export { DefaultFocus } from './components/DefaultFocus';

// Virtualized Components
export { SpatialNavigationVirtualizedList } from './components/SpatialNavigationVirtualizedList';
export { SpatialNavigationVirtualizedGrid } from './components/SpatialNavigationVirtualizedGrid';

// Device Type Provider
export { 
  SpatialNavigationDeviceTypeProvider, 
  useDeviceType 
} from './context/DeviceTypeContext';

// Hooks
export { useFocusable } from './hooks/useFocusable';
export { useLockSpatialNavigation } from './hooks/useLockSpatialNavigation';
export { useSpatialNavigatorFocusableAccessibilityProps } from './hooks/useSpatialNavigatorFocusableAccessibilityProps';

// Legacy Components (simple API - still supported)
export { Grid } from './components/Grid';
export { List } from './components/List';

// Utilities
export { navigationEventBus } from './utils/eventBus';
export {
  generateSectionId,
  isElementFocused,
  focusElement,
  blurElement,
} from './utils/helpers';
export { 
  configureRemoteControl, 
  getRemoteControlConfig, 
  resetRemoteControlConfig,
  TV_REMOTE_KEYS 
} from './utils/remoteControl';

// Types
export type {
  Direction,
  Orientation,
  FocusDetail,
  FocusableConfig,
  UseFocusableReturn,
  SectionConfig,
  GridConfig,
  ListConfig,
  GridProps,
  ListProps,
  SpatialNavigationContextValue,
  SpatialNavigationProviderProps,
  SpatialNavigationRootProps,
  NodeChildParams,
  SpatialNavigationNodeProps,
  SpatialNavigationNodeRef,
  SpatialNavigationViewProps,
  SpatialNavigationFocusableViewProps,
  SpatialNavigationScrollViewProps,
} from './types';

export type { NavigationEvents } from './utils/eventBus';
export type { DeviceType, DeviceTypeContextValue } from './context/DeviceTypeContext';
export type { DefaultFocusProps } from './components/DefaultFocus';
export type { RemoteControlConfig } from './utils/remoteControl';
export type { 
  SpatialNavigationVirtualizedListProps 
} from './components/SpatialNavigationVirtualizedList';
export type { 
  SpatialNavigationVirtualizedGridProps 
} from './components/SpatialNavigationVirtualizedGrid';
export type { 
  AccessibilityOptions, 
  AccessibilityProps 
} from './hooks/useSpatialNavigatorFocusableAccessibilityProps';
export type { 
  UseLockSpatialNavigationReturn 
} from './hooks/useLockSpatialNavigation';

