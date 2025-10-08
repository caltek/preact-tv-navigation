import type { JSX } from 'preact';

/**
 * Direction for spatial navigation
 */
export type Direction = 'left' | 'right' | 'up' | 'down';

/**
 * Orientation for layouts
 */
export type Orientation = 'vertical' | 'horizontal';

/**
 * Focus event detail from js-spatial-navigation
 */
export interface FocusDetail {
  sectionId?: string;
  direction?: Direction;
  previousElement?: HTMLElement;
  nextElement?: HTMLElement;
  native?: boolean;
}

/**
 * Configuration for a focusable element
 */
export interface FocusableConfig {
  /** Callback when element gains focus */
  onFocus?: (event?: FocusEvent) => void;
  /** Callback when element loses focus */
  onBlur?: (event?: FocusEvent) => void;
  /** Callback when enter key is pressed */
  onEnterPress?: () => void;
  /** Whether the element should be focusable */
  disabled?: boolean;
  /** Whether this element should auto-focus on mount */
  autoFocus?: boolean;
  /** Custom class name when focused */
  focusedClassName?: string;
  /** ID for tracking this focusable element */
  trackingId?: string;
}

/**
 * Return type for useFocusable hook
 */
export interface UseFocusableReturn {
  /** Ref to attach to the focusable element */
  ref: (element: HTMLElement | null) => void;
  /** Whether this element is currently focused */
  focused: boolean;
  /** Programmatically focus this element */
  focus: () => void;
  /** Programmatically blur this element */
  blur: () => void;
}

/**
 * Configuration for navigation sections (grids, lists, etc.)
 */
export interface SectionConfig {
  /** Unique ID for this section */
  id?: string;
  /** Default element selector to focus when entering section */
  defaultElement?: string;
  /** Navigation behavior when entering this section */
  enterTo?: '' | 'last-focused' | 'default-element';
  /** Restrict navigation within section */
  restrict?: 'self-first' | 'self-only' | 'none';
  /** Whether section is disabled */
  disabled?: boolean;
}

/**
 * Configuration for Grid component
 */
export interface GridConfig extends SectionConfig {
  /** Number of columns in the grid */
  columns?: number;
  /** Gap between items (in CSS units) */
  gap?: string;
  /** Whether to remember last focused item */
  rememberLastFocus?: boolean;
}

/**
 * Configuration for List component
 */
export interface ListConfig extends SectionConfig {
  /** Orientation of the list */
  orientation?: 'vertical' | 'horizontal';
  /** Gap between items (in CSS units) */
  gap?: string;
  /** Whether to remember last focused item */
  rememberLastFocus?: boolean;
}

/**
 * Props for Grid component
 */
export interface GridProps extends GridConfig {
  children: JSX.Element | JSX.Element[];
  className?: string;
  style?: JSX.CSSProperties;
}

/**
 * Props for List component
 */
export interface ListProps extends ListConfig {
  children: JSX.Element | JSX.Element[];
  className?: string;
  style?: JSX.CSSProperties;
}

/**
 * Spatial Navigation context value
 */
export interface SpatialNavigationContextValue {
  /** Whether the navigation system is initialized */
  initialized: boolean;
  /** Currently focused section ID */
  currentSectionId: string | null;
  /** Register a new section */
  registerSection: (config: SectionConfig) => string;
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

/**
 * Props for SpatialNavigationProvider (legacy name)
 */
export interface SpatialNavigationProviderProps {
  children: JSX.Element | JSX.Element[];
  /** Custom configuration for js-spatial-navigation */
  config?: {
    selector?: string;
    straightOnly?: boolean;
    straightOverlapThreshold?: number;
    rememberSource?: boolean;
    disabled?: boolean;
    defaultElement?: string;
    enterTo?: '' | 'last-focused' | 'default-element';
    leaveFor?: {
      left?: string;
      right?: string;
      up?: string;
      down?: string;
    };
    restrict?: 'self-first' | 'self-only' | 'none';
    tabIndexIgnoreList?: string;
    navigableFilter?: (element: HTMLElement) => boolean;
  };
}

/**
 * Props for SpatialNavigationRoot
 */
export interface SpatialNavigationRootProps extends SpatialNavigationProviderProps {
  /** Determines if the spatial navigation is active */
  isActive?: boolean;
  /** Called when reaching a border of the navigator */
  onDirectionHandledWithoutMovement?: (direction: Direction) => void;
}

/**
 * Parameters passed to children render function in SpatialNavigationNode
 */
export interface NodeChildParams {
  isFocused: boolean;
  isActive: boolean;
  isRootActive: boolean;
}

/**
 * Props for SpatialNavigationNode
 */
export interface SpatialNavigationNodeProps {
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
  orientation?: Orientation;
  /** Whether the node itself is focusable */
  isFocusable?: boolean;
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Index range for grid long nodes */
  indexRange?: number[];
  /** Additional offset for scroll */
  additionalOffset?: number;
  /** Register this container as a section to isolate navigation */
  registerSection?: boolean;
  /** Restrict navigation: 'self-only' prevents leaving section, 'self-first' tries section first */
  restrict?: 'self-only' | 'self-first' | 'none';
  /** Children - can be function or ReactNode */
  children: ((params: NodeChildParams) => JSX.Element) | JSX.Element | JSX.Element[];
}

/**
 * Ref methods for SpatialNavigationNode
 */
export interface SpatialNavigationNodeRef {
  focus: () => void;
}

/**
 * Props for SpatialNavigationView
 */
export interface SpatialNavigationViewProps {
  /** Direction of the layout */
  direction?: Orientation;
  /** Whether child lists should behave like a grid */
  alignInGrid?: boolean;
  /** Style for the view */
  style?: JSX.CSSProperties;
  /** Children elements */
  children: JSX.Element | JSX.Element[];
}

/**
 * Props for SpatialNavigationFocusableView
 */
export interface SpatialNavigationFocusableViewProps extends Omit<SpatialNavigationNodeProps, 'isFocusable' | 'children'> {
  /** Style for the view */
  style?: JSX.CSSProperties;
  /** Props to pass to the inner view */
  viewProps?: JSX.HTMLAttributes<HTMLDivElement>;
  /** Children - render function */
  children: (params: NodeChildParams) => JSX.Element;
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
  children: JSX.Element | JSX.Element[];
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

