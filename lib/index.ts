/**
 * Preact Spatial Navigation Library
 * 
 * A reusable library for TV-style spatial navigation in Preact applications,
 * powered by @bam.tech/lrud.
 */

// Export Direction enum from lrud
export { Directions } from '@bam.tech/lrud';

// Root Component
export {
  SpatialNavigationRoot,
  SpatialNavigationProvider, // Legacy name for backward compatibility
} from './components/SpatialNavigationRoot';

// Core Navigation Components
export { SpatialNavigationNode } from './components/SpatialNavigationNode';
export { SpatialNavigationView } from './components/SpatialNavigationView';
export { SpatialNavigationFocusableView } from './components/SpatialNavigationFocusableView';
export { SpatialNavigationScrollView } from './components/SpatialNavigationScrollView';
export { DefaultFocus } from './context/DefaultFocusContext';

// Virtualized Components (LRUD-based implementation from react-tv-space-navigation)
export { SpatialNavigationVirtualizedList } from './components/virtualizedList/SpatialNavigationVirtualizedList';
export { SpatialNavigationVirtualizedGrid } from './components/virtualizedGrid/SpatialNavigationVirtualizedGrid';

// Device Type Provider
export { 
  SpatialNavigationDeviceTypeProvider, 
  useDeviceType 
} from './context/DeviceTypeContext';

// Contexts and Hooks
export { useSpatialNavigator, useSpatialNavigatorContext } from './context/SpatialNavigatorContext';
export { useLockSpatialNavigation } from './context/LockSpatialNavigationContext';
export { useSpatialNavigatorFocusableAccessibilityProps } from './hooks/useSpatialNavigatorFocusableAccessibilityProps';

// Legacy Components - REMOVED after migration to @bam.tech/lrud
// Grid and List components are no longer available
// Use SpatialNavigationView or SpatialNavigationFocusableView instead

// Legacy Hooks (deprecated - will be removed in future version)
/** @deprecated Use SpatialNavigationNode with render props pattern instead */
export { useFocusable } from './hooks/useFocusable';

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
  createKeyboardRemoteControl,
  TV_REMOTE_KEYS 
} from './utils/remoteControl';

// Export the main namespace object
import { configureRemoteControl as _configureRemoteControl } from './utils/remoteControl';
export const SpatialNavigation = {
  configureRemoteControl: _configureRemoteControl,
};

// Types
export type {
  Direction,
  Orientation,
  NodeOrientation,
  FocusableNodeState,
  NonFocusableNodeState,
  SpatialNavigationRootProps,
  SpatialNavigationNodeProps,
  SpatialNavigationNodeFocusableProps,
  SpatialNavigationNodeNonFocusableProps,
  SpatialNavigationNodeRef,
  SpatialNavigationViewProps,
  SpatialNavigationFocusableViewProps,
  SpatialNavigationScrollViewProps,
  SpatialNavigationContextValue,
  // Legacy types (deprecated)
  FocusableConfig,
  UseFocusableReturn,
  SpatialNavigationProviderProps,
  FocusDetail,
  // GridProps, ListProps, SectionConfig, GridConfig, ListConfig - REMOVED
} from './types';

export type { NavigationEvents } from './utils/eventBus';
export type { DeviceType, DeviceTypeContextValue } from './context/DeviceTypeContext';
export type { DefaultFocusProps } from './context/DefaultFocusContext';
export type { RemoteControlConfiguration } from './utils/remoteControl';
export type { VirtualizedListProps } from './components/virtualizedList/VirtualizedList';
export type { 
  SpatialNavigationVirtualizedListRef,
  SpatialNavigationVirtualizedListWithScrollProps,
  PointerScrollProps,
} from './components/virtualizedList/SpatialNavigationVirtualizedListWithScroll';
export type { 
  SpatialNavigationVirtualizedGridRef 
} from './components/virtualizedGrid/SpatialNavigationVirtualizedGrid';
export type { ScrollBehavior } from './components/virtualizedList/types';
export type { 
  AccessibilityOptions, 
  AccessibilityProps 
} from './hooks/useSpatialNavigatorFocusableAccessibilityProps';
export type { 
  UseLockSpatialNavigationReturn 
} from './hooks/useLockSpatialNavigation';
