import { useEffect, useState, useCallback, useRef } from 'preact/hooks';
import type { FocusableConfig, UseFocusableReturn } from '../types';
import { navigationEventBus } from '../utils/eventBus';
import { isElementFocused, focusElement, blurElement, addClass, removeClass } from '../utils/helpers';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Hook to make an element focusable with spatial navigation
 * 
 * @param config - Configuration for the focusable element
 * @returns Object containing ref, focused state, and focus/blur methods
 * 
 * @example
 * ```tsx
 * const { ref, focused } = useFocusable({
 *   onFocus: () => console.log('Focused!'),
 *   onEnterPress: () => console.log('Enter pressed!'),
 * });
 * 
 * return <div ref={ref} class={focused ? 'focused' : ''}>Focusable Item</div>;
 * ```
 */
export function useFocusable(config: FocusableConfig = {}): UseFocusableReturn {
  const {
    onFocus,
    onBlur,
    onEnterPress,
    disabled = false,
    autoFocus = false,
    focusedClassName,
    trackingId,
  } = config;

  const elementRef = useRef<HTMLElement | null>(null);
  const [focused, setFocused] = useState(false);
  const makeFocusableCalledRef = useRef(false);

  // Handle focus event
  const handleFocus = useCallback((event?: FocusEvent) => {
    if (disabled) return;

    setFocused(true);
    
    if (focusedClassName && elementRef.current) {
      addClass(elementRef.current, focusedClassName);
    }
    
    if (onFocus) {
      onFocus(event);
    }
  }, [disabled, onFocus, focusedClassName]);

  // Handle blur event
  const handleBlur = useCallback((event?: FocusEvent) => {
    setFocused(false);
    
    if (focusedClassName && elementRef.current) {
      removeClass(elementRef.current, focusedClassName);
    }
    
    if (onBlur) {
      onBlur(event);
    }
  }, [onBlur, focusedClassName]);

  // Handle enter key press
  useEffect(() => {
    if (!onEnterPress) return;

    const handleEnterDown = () => {
      if (focused && !disabled) {
        onEnterPress();
      }
    };

    navigationEventBus.on('enterdown', handleEnterDown);

    return () => {
      navigationEventBus.off('enterdown', handleEnterDown);
    };
  }, [focused, disabled, onEnterPress]);

  // Set up element and event listeners
  const setRef = useCallback((element: HTMLElement | null) => {
    // Clean up previous element
    if (elementRef.current) {
      elementRef.current.removeEventListener('focus', handleFocus);
      elementRef.current.removeEventListener('blur', handleBlur);
      elementRef.current.classList.remove('focusable');
      if (trackingId) {
        elementRef.current.removeAttribute('data-tracking-id');
      }
    }

    elementRef.current = element;
    makeFocusableCalledRef.current = false;

    if (element) {
      // Add focusable class for spatial navigation
      element.classList.add('focusable');
      
      // Add tracking ID if provided
      if (trackingId) {
        element.setAttribute('data-tracking-id', trackingId);
      }

      // Make element focusable
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
      }

      // Set disabled state
      if (disabled) {
        element.setAttribute('data-disabled', 'true');
      } else {
        element.removeAttribute('data-disabled');
      }

      // Add event listeners
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      // Call makeFocusable to register with js-spatial-navigation
      // Small delay to ensure element is in the DOM
      setTimeout(() => {
        if (!makeFocusableCalledRef.current) {
          SpatialNavigation.makeFocusable();
          makeFocusableCalledRef.current = true;
          
          // Auto focus if requested
          if (autoFocus) {
            focusElement(element);
          }
        }
      }, 50);

      // Check if already focused
      if (isElementFocused(element)) {
        setFocused(true);
        if (focusedClassName) {
          addClass(element, focusedClassName);
        }
      }
    }
  }, [handleFocus, handleBlur, disabled, autoFocus, focusedClassName, trackingId]);

  // Update disabled state when it changes
  useEffect(() => {
    if (elementRef.current) {
      if (disabled) {
        elementRef.current.setAttribute('data-disabled', 'true');
        if (focused) {
          blurElement(elementRef.current);
        }
      } else {
        elementRef.current.removeAttribute('data-disabled');
      }
    }
  }, [disabled, focused]);

  // Programmatic focus method
  const focus = useCallback(() => {
    if (!disabled && elementRef.current) {
      focusElement(elementRef.current);
    }
  }, [disabled]);

  // Programmatic blur method
  const blur = useCallback(() => {
    if (elementRef.current) {
      blurElement(elementRef.current);
    }
  }, []);

  return {
    ref: setRef,
    focused,
    focus,
    blur,
  };
}

