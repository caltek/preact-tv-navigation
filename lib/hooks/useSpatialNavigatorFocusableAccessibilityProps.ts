
/**
 * Options for accessibility props
 */
export interface AccessibilityOptions {
  /** Accessible label for screen readers */
  label?: string;
  /** Accessible hint/description */
  hint?: string;
  /** Role override (default: 'button') */
  role?: string;
  /** Whether the element is currently selected/checked */
  isSelected?: boolean;
  /** Whether the element is disabled */
  isDisabled?: boolean;
}

/**
 * Return type for accessibility props
 */
export interface AccessibilityProps {
  role: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  tabIndex: number;
}

/**
 * useSpatialNavigatorFocusableAccessibilityProps - Generate accessibility props
 * Provides ARIA attributes for focusable elements to improve screen reader support
 * 
 * @param options - Accessibility options
 * @returns Object with ARIA attributes to spread on element
 * 
 * @example
 * ```tsx
 * function MyButton({ label, isFocused }: any) {
 *   const a11yProps = useSpatialNavigatorFocusableAccessibilityProps({
 *     label: 'Play Movie',
 *     hint: 'Press Enter to play',
 *     isSelected: isFocused,
 *   });
 *   
 *   return <div {...a11yProps}>Play</div>;
 * }
 * ```
 */
export function useSpatialNavigatorFocusableAccessibilityProps(
  options: AccessibilityOptions = {}
): AccessibilityProps {
  const {
    label,
    hint,
    role = 'button',
    isSelected = false,
    isDisabled = false,
  } = options;

  const props: AccessibilityProps = {
    role,
    tabIndex: isDisabled ? -1 : 0,
  };

  if (label) {
    props['aria-label'] = label;
  }

  if (hint) {
    props['aria-describedby'] = hint;
  }

  if (isSelected !== undefined) {
    props['aria-selected'] = isSelected;
  }

  if (isDisabled !== undefined) {
    props['aria-disabled'] = isDisabled;
  }

  return props;
}

