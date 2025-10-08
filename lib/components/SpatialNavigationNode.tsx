/** @jsxImportSource preact */
import { forwardRef } from 'preact/compat';
import { useEffect, useState, useCallback, useRef, useImperativeHandle, useMemo } from 'preact/hooks';
import type { SpatialNavigationNodeProps, SpatialNavigationNodeRef, NodeChildParams } from '../types';
import { useSpatialNavigationContext } from './SpatialNavigationRoot';
import { navigationEventBus } from '../utils/eventBus';
import { generateSectionId, focusElement } from '../utils/helpers';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * SpatialNavigationNode - Core component for spatial navigation
 * Can be focusable itself or a container for focusable children
 */
export const SpatialNavigationNode = forwardRef<SpatialNavigationNodeRef, SpatialNavigationNodeProps>(
  (
    {
      onFocus,
      onBlur,
      onSelect,
      onLongSelect,
      onActive,
      onInactive,
      orientation = 'vertical',
      isFocusable = false,
      alignInGrid = false,
      indexRange,
      additionalOffset = 0,
      registerSection = false,
      restrict = 'self-first',
      children,
    },
    ref
  ) => {
    const { rootActive } = useSpatialNavigationContext();
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const enterPressTimeRef = useRef<number | null>(null);
    const wasActiveRef = useRef(false);
    const sectionIdRef = useRef<string | null>(null);

    // Generate stable section/element ID
    const nodeId = useMemo(() => generateSectionId(isFocusable ? 'focusable' : 'node'), [isFocusable]);

    // Expose focus method via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (elementRef.current) {
          if (isFocusable) {
            focusElement(elementRef.current);
          } else if (sectionIdRef.current) {
            SpatialNavigation.focus(sectionIdRef.current);
          }
        }
      },
    }));

    // Handle focus state for focusable nodes
    const handleFocusEvent = useCallback((_event?: FocusEvent) => {
      if (!isFocusable) return;
      
      setIsFocused(true);
      setIsActive(true);
      
      if (onFocus) {
        onFocus();
      }
      
      if (onActive && !wasActiveRef.current) {
        onActive();
        wasActiveRef.current = true;
      }
    }, [isFocusable, onFocus, onActive]);

    const handleBlurEvent = useCallback((_event?: FocusEvent) => {
      if (!isFocusable) return;
      
      setIsFocused(false);
      
      if (onBlur) {
        onBlur();
      }
    }, [isFocusable, onBlur]);

    // Handle enter key for select
    useEffect(() => {
      if (!isFocusable) return;

      const handleEnterDown = () => {
        if (isFocused) {
          enterPressTimeRef.current = Date.now();
        }
      };

      const handleEnterUp = () => {
        if (isFocused && enterPressTimeRef.current) {
          const pressDuration = Date.now() - enterPressTimeRef.current;
          enterPressTimeRef.current = null;
          
          // Long press threshold: 500ms
          if (pressDuration >= 500 && onLongSelect) {
            onLongSelect();
          } else if (onSelect) {
            onSelect();
          }
        }
      };

      navigationEventBus.on('enterdown', handleEnterDown);
      navigationEventBus.on('enterup', handleEnterUp);

      return () => {
        navigationEventBus.off('enterdown', handleEnterDown);
        navigationEventBus.off('enterup', handleEnterUp);
      };
    }, [isFocused, isFocusable, onSelect, onLongSelect]);

    // Track active state for non-focusable containers
    useEffect(() => {
      if (isFocusable) return;

      const checkActiveState = () => {
        const focusedElement = document.activeElement;
        const container = elementRef.current;
        
        if (container && focusedElement) {
          const newIsActive = container.contains(focusedElement);
          
          if (newIsActive !== isActive) {
            setIsActive(newIsActive);
            
            if (newIsActive && onActive && !wasActiveRef.current) {
              onActive();
              wasActiveRef.current = true;
            } else if (!newIsActive && onInactive && wasActiveRef.current) {
              onInactive();
              wasActiveRef.current = false;
            }
          }
        }
      };

      // Check on focus/blur events
      const handleFocus = checkActiveState;
      const handleBlur = checkActiveState;

      navigationEventBus.on('focus', handleFocus);
      navigationEventBus.on('blur', handleBlur);

      return () => {
        navigationEventBus.off('focus', handleFocus);
        navigationEventBus.off('blur', handleBlur);
      };
    }, [isFocusable, isActive, onActive, onInactive]);

    // Set up focusable element or section
    useEffect(() => {
      if (!elementRef.current) return;

      if (isFocusable) {
        // Make this element focusable
        elementRef.current.classList.add('focusable');
        
        if (!elementRef.current.hasAttribute('tabindex')) {
          elementRef.current.setAttribute('tabindex', '-1');
        }

        // Add event listeners
        elementRef.current.addEventListener('focus', handleFocusEvent);
        elementRef.current.addEventListener('blur', handleBlurEvent);

        // Don't call SpatialNavigation.makeFocusable() here!
        // The default section in SpatialNavigationRoot will pick up all .focusable elements
        // via its selector: '.focusable', and calling makeFocusable causes js-spatial-navigation
        // to auto-create unwanted sections like "section-1"

        return () => {
          if (elementRef.current) {
            elementRef.current.removeEventListener('focus', handleFocusEvent);
            elementRef.current.removeEventListener('blur', handleBlurEvent);
            elementRef.current.classList.remove('focusable');
          }
        };
      } else if (registerSection) {
        // Register container as a section to isolate navigation
        const sectionId = nodeId;
        sectionIdRef.current = sectionId;
        elementRef.current.id = sectionId;

        SpatialNavigation.add(sectionId, {
          selector: '.focusable',
          restrict, // Use the restrict prop value
          enterTo: 'last-focused',
        });

        // Make the section focusable
        SpatialNavigation.makeFocusable(sectionId);

        return () => {
          if (sectionIdRef.current) {
            SpatialNavigation.remove(sectionIdRef.current);
            sectionIdRef.current = null;
          }
        };
      } else {
        // Container nodes don't register as sections
        // They're just layout containers - all focusable children
        // register with the default section for seamless navigation
        return () => {
          // No cleanup needed
        };
      }
    }, [isFocusable, registerSection, nodeId, alignInGrid, handleFocusEvent, handleBlurEvent]);

    // Re-make focusable when children change
    // Note: Only for registered container sections
    useEffect(() => {
      if (!registerSection || !sectionIdRef.current) return;

      const timer = setTimeout(() => {
        if (sectionIdRef.current) {
          SpatialNavigation.makeFocusable(sectionIdRef.current);
        }
      }, 50);

      return () => clearTimeout(timer);
    }, [children, registerSection]);

    // Determine styles based on orientation
    // Only apply flex layout for non-focusable container nodes
    const containerStyle: any = isFocusable
      ? {
          outline: 'none',
        }
      : {
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          outline: 'none',
        };

    // If children is a function, call it with state
    const renderChildren = () => {
      if (typeof children === 'function') {
        const params: NodeChildParams = {
          isFocused,
          isActive,
          isRootActive: rootActive,
        };
        return children(params);
      }
      return children;
    };

    return (
      <div
        ref={elementRef}
        style={containerStyle}
        data-orientation={orientation}
        data-align-in-grid={alignInGrid}
        data-additional-offset={additionalOffset}
        data-index-range={indexRange?.join(',')}
      >
        {renderChildren()}
      </div>
    );
  }
);

SpatialNavigationNode.displayName = 'SpatialNavigationNode';

