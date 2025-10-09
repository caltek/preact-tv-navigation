import type { JSX } from 'preact';
import type { ComponentChildren } from 'preact';

/**
 * Direction for spatial navigation (from @bam.tech/lrud)
 */
export type Direction = 'left' | 'right' | 'up' | 'down';

/**
 * Orientation for layouts
 */
export type Orientation = 'vertical' | 'horizontal';

/**
 * Node orientation (alias for compatibility)
 */
export type NodeOrientation = Orientation;

/**
 * Ref methods for SpatialNavigationNode
 */
export interface SpatialNavigationNodeRef {
  focus: () => void;
}

/**
 * Parameters passed to children render function in SpatialNavigationNode (focusable)
 */
export interface FocusableNodeState {
  /** Whether this node is currently focused */
  isFocused: boolean;
  /** Whether this node is active (has a focused child) */
  isActive: boolean;
  /** Whether the root navigator is active */
  isRootActive: boolean;
}

/**
 * Parameters passed to children render function in SpatialNavigationNode (non-focusable)
 */
export interface NonFocusableNodeState {
  /** Whether this node is active (has a focused child) */
  isActive: boolean;
  /** Whether the root navigator is active */
  isRootActive: boolean;
}

/**
 * Props for SpatialNavigationRoot
 */
export interface SpatialNavigationRootProps {
  /** Determines if the spatial navigation is active */
  isActive?: boolean;
  /** Called when reaching a border of the navigator */
  onDirectionHandledWithoutMovement?: (direction: Direction) => void;
  /** Children elements */
  children: ComponentChildren;
}

/**
 * Props for SpatialNavigationNode (focusable variant)
 */
export interface SpatialNavigationNodeFocusableProps {
  /** This node is focusable */
  isFocusable: true;
  /** Children - render function receiving focus state */
  children: (props: FocusableNodeState) => JSX.Element;
  /** Callback when node gains focus */
  onFocus?: () => void;
  /** Callback when node loses focus */
  onBlur?: () => void;
  /** Callback when node is selected (Enter key) */
  onSelect?: () => void;
  /** Callback when node is selected with long press */
  onLongSelect?: () => void;
  /** Callback when node becomes active (child is focused) */
  onActive?: () => void;
  /** Callback when node becomes inactive */
  onInactive?: () => void;
  /** Orientation of the node */
  orientation?: NodeOrientation;
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Index range for grid alignment */
  indexRange?: { start: number; end: number };
  /** Additional offset for scroll */
  additionalOffset?: number;
}

/**
 * Props for SpatialNavigationNode (non-focusable variant)
 */
export interface SpatialNavigationNodeNonFocusableProps {
  /** This node is not focusable (container only) */
  isFocusable?: false;
  /** Children - can be render function or elements */
  children: ComponentChildren | ((props: NonFocusableNodeState) => JSX.Element);
  /** Callback when node becomes active (child is focused) */
  onActive?: () => void;
  /** Callback when node becomes inactive */
  onInactive?: () => void;
  /** Orientation of the node */
  orientation?: NodeOrientation;
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Index range for grid alignment */
  indexRange?: { start: number; end: number };
  /** Additional offset for scroll */
  additionalOffset?: number;
}

/**
 * Props for SpatialNavigationNode (union of focusable and non-focusable)
 */
export type SpatialNavigationNodeProps =
  | SpatialNavigationNodeFocusableProps
  | SpatialNavigationNodeNonFocusableProps;

/**
 * Props for SpatialNavigationView
 */
export interface SpatialNavigationViewProps {
  /** Direction of the layout */
  direction: 'horizontal' | 'vertical';
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Style for the view */
  style?: JSX.CSSProperties;
  /** Children elements */
  children: ComponentChildren;
}

/**
 * Props for SpatialNavigationFocusableView
 */
export interface SpatialNavigationFocusableViewProps {
  /** Callback when node gains focus */
  onFocus?: () => void;
  /** Callback when node loses focus */
  onBlur?: () => void;
  /** Callback when node is selected (Enter key) */
  onSelect?: () => void;
  /** Callback when node is selected with long press */
  onLongSelect?: () => void;
  /** Callback when node becomes active (child is focused) */
  onActive?: () => void;
  /** Callback when node becomes inactive */
  onInactive?: () => void;
  /** Orientation of the node */
  orientation?: NodeOrientation;
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Index range for grid alignment */
  indexRange?: { start: number; end: number };
  /** Additional offset for scroll */
  additionalOffset?: number;
  /** Style for the view */
  style?: JSX.CSSProperties;
  /** Props to pass to the inner div */
  viewProps?: JSX.HTMLAttributes<HTMLDivElement>;
  /** Children - can be render function or element */
  children: JSX.Element | ((props: FocusableNodeState) => JSX.Element);
}

/**
 * Props for SpatialNavigationScrollView
 */
export interface SpatialNavigationScrollViewProps {
  /** Whether scrolling is horizontal */
  horizontal?: boolean;
  /** Offset from start edge in pixels */
  offsetFromStart?: number;
  /** Style for the scroll view */
  style?: JSX.CSSProperties;
  /** Children elements */
  children: ComponentChildren;
  /** Arrow for ascending scroll (web TV cursor) */
  ascendingArrow?: JSX.Element;
  /** Style for ascending arrow container */
  ascendingArrowContainerStyle?: JSX.CSSProperties;
  /** Arrow for descending scroll (web TV cursor) */
  descendingArrow?: JSX.Element;
  /** Style for descending arrow container */
  descendingArrowContainerStyle?: JSX.CSSProperties;
  /** Scroll speed in pixels per 10ms on pointer hover */
  pointerScrollSpeed?: number;
  /** Use native scroll instead of CSS scroll */
  useNativeScroll?: boolean;
}

/**
 * Spatial Navigation context value (legacy - for backward compatibility)
 */
export interface SpatialNavigationContextValue {
  /** Whether the navigation system is initialized */
  initialized: boolean;
  /** Currently focused section ID */
  currentSectionId: string | null;
  /** Register a new section */
  registerSection: (config: any) => string;
  /** Unregister a section */
  unregisterSection: (sectionId: string) => void;
  /** Set focus to a specific section */
  focusSection: (sectionId: string) => void;
  /** Pause navigation */
  pause: () => void;
  /** Resume navigation */
  resume: () => void;
  /** Whether the root is currently active */
  rootActive: boolean;
}

// Legacy types (for backward compatibility - deprecated)
/**
 * @deprecated Use the new render props API with SpatialNavigationNode
 */
export interface FocusableConfig {
  onFocus?: (event?: FocusEvent) => void;
  onBlur?: (event?: FocusEvent) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  focusedClassName?: string;
  trackingId?: string;
}

/**
 * @deprecated Use the new render props API with SpatialNavigationNode
 */
export interface UseFocusableReturn {
  ref: (element: HTMLElement | null) => void;
  focused: boolean;
  focus: () => void;
  blur: () => void;
}

/**
 * @deprecated Legacy Grid component props - use SpatialNavigationView with alignInGrid instead
 */
export interface GridProps {
  children: ComponentChildren;
  columns?: number;
  gap?: string;
  className?: string;
  style?: JSX.CSSProperties;
  id?: string;
  enterTo?: '' | 'last-focused' | 'default-element';
  restrict?: 'self-first' | 'self-only' | 'none';
  disabled?: boolean;
  rememberLastFocus?: boolean;
  defaultElement?: string;
}

/**
 * @deprecated Legacy List component props - use SpatialNavigationView instead
 */
export interface ListProps {
  children: ComponentChildren;
  orientation?: 'vertical' | 'horizontal';
  gap?: string;
  className?: string;
  style?: JSX.CSSProperties;
  id?: string;
  enterTo?: '' | 'last-focused' | 'default-element';
  restrict?: 'self-first' | 'self-only' | 'none';
  disabled?: boolean;
  rememberLastFocus?: boolean;
  defaultElement?: string;
}

/**
 * @deprecated Legacy configuration
 */
export interface SectionConfig {
  id?: string;
  defaultElement?: string;
  enterTo?: '' | 'last-focused' | 'default-element';
  restrict?: 'self-first' | 'self-only' | 'none';
  disabled?: boolean;
}

/**
 * @deprecated Legacy Grid configuration
 */
export interface GridConfig extends SectionConfig {
  columns?: number;
  gap?: string;
  rememberLastFocus?: boolean;
}

/**
 * @deprecated Legacy List configuration
 */
export interface ListConfig extends SectionConfig {
  orientation?: 'vertical' | 'horizontal';
  gap?: string;
  rememberLastFocus?: boolean;
}

/**
 * @deprecated Use SpatialNavigationRootProps
 */
export interface SpatialNavigationProviderProps {
  children: ComponentChildren;
  config?: Record<string, any>;
}

/**
 * Focus event detail (legacy)
 * @deprecated
 */
export interface FocusDetail {
  sectionId?: string;
  direction?: Direction;
  previousElement?: HTMLElement;
  nextElement?: HTMLElement;
  native?: boolean;
}
