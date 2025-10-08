import { createContext } from 'preact';
import { useContext, useEffect, useState, useCallback, useRef } from 'preact/hooks';
import type { SpatialNavigationRootProps, SpatialNavigationContextValue, Direction } from '../types';
import { navigationEventBus } from '../utils/eventBus';
import { generateSectionId } from '../utils/helpers';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Context for spatial navigation (internal)
 */
const SpatialNavigationContext = createContext<SpatialNavigationContextValue | null>(null);

/**
 * Root component for spatial navigation
 * Manages the global navigation state and provides context to child components
 */
export function SpatialNavigationRoot({ 
  children, 
  config = {},
  isActive = true,
  onDirectionHandledWithoutMovement,
}: SpatialNavigationRootProps) {
  const [initialized, setInitialized] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [rootActive, setRootActive] = useState(isActive);
  const previousIsActive = useRef(isActive);

  // Handle isActive changes
  useEffect(() => {
    if (previousIsActive.current !== isActive) {
      if (isActive) {
        SpatialNavigation.resume();
        setRootActive(true);
      } else {
        SpatialNavigation.pause();
        setRootActive(false);
      }
      previousIsActive.current = isActive;
    }
  }, [isActive]);

  useEffect(() => {
    // Initialize SpatialNavigation
    SpatialNavigation.init();

    // Set default configuration
    SpatialNavigation.set({
      selector: '.focusable',
      straightOnly: false,
      straightOverlapThreshold: 0.5,
      rememberSource: false,
      disabled: false,
      defaultElement: '',
      enterTo: 'last-focused',
      leaveFor: null,
      restrict: 'self-first',
      tabIndexIgnoreList: 'a, input, select, textarea, button, iframe, [contentEditable=true]',
      navigableFilter: null,
      ...config,
    });

    // Add default section for elements not in specific sections
    SpatialNavigation.add('', {
      selector: '.focusable',
      restrict: 'self-first', // Try to stay within section first, at boundary allow section exit
      enterTo: 'last-focused',
    });

    // Don't call makeFocusable('') as it causes js-spatial-navigation to auto-create "section-1"
    // The selector: '.focusable' above will automatically pick up all elements with that class

    setInitialized(true);

    // Set up event listeners for js-spatial-navigation events
    const handleFocus = (event: Event) => {
      const customEvent = event as CustomEvent;
      navigationEventBus.emit('focus', customEvent.detail);
      
      if (customEvent.detail?.sectionId) {
        setCurrentSectionId(customEvent.detail.sectionId);
      }
    };

    const handleBlur = (event: Event) => {
      const customEvent = event as CustomEvent;
      navigationEventBus.emit('blur', customEvent.detail);
    };

    const handleWillMove = (event: Event) => {
      const customEvent = event as CustomEvent;
      navigationEventBus.emit('willmove', customEvent.detail);
    };

    const handleNavigateFailed = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      
      navigationEventBus.emit('navigatefailed', detail);
      
      // Call onDirectionHandledWithoutMovement when navigation fails (border reached)
      if (onDirectionHandledWithoutMovement && detail?.direction) {
        onDirectionHandledWithoutMovement(detail.direction as Direction);
      }
    };

    const handleEnterDown = () => {
      navigationEventBus.emit('enterdown', undefined);
    };

    const handleEnterUp = () => {
      navigationEventBus.emit('enterup', undefined);
    };

    // Bind to document for spatial navigation events
    document.addEventListener('sn:focused', handleFocus);
    document.addEventListener('sn:unfocused', handleBlur);
    document.addEventListener('sn:willmove', handleWillMove);
    document.addEventListener('sn:navigatefailed', handleNavigateFailed);
    document.addEventListener('sn:enter-down', handleEnterDown);
    document.addEventListener('sn:enter-up', handleEnterUp);

    // Apply initial active state
    if (!isActive) {
      SpatialNavigation.pause();
      setRootActive(false);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('sn:focused', handleFocus);
      document.removeEventListener('sn:unfocused', handleBlur);
      document.removeEventListener('sn:willmove', handleWillMove);
      document.removeEventListener('sn:navigatefailed', handleNavigateFailed);
      document.removeEventListener('sn:enter-down', handleEnterDown);
      document.removeEventListener('sn:enter-up', handleEnterUp);
      
      navigationEventBus.clear();
      SpatialNavigation.uninit();
    };
  }, []);

  const registerSection = useCallback((sectionConfig: any): string => {
    const sectionId = sectionConfig.id || generateSectionId('section');
    
    SpatialNavigation.add(sectionId, {
      selector: '.focusable',
      defaultElement: sectionConfig.defaultElement || '',
      enterTo: sectionConfig.enterTo || 'last-focused',
      restrict: sectionConfig.restrict || 'none', // Default to 'none' for seamless navigation
      disabled: sectionConfig.disabled || false,
    });

    return sectionId;
  }, []);

  const unregisterSection = useCallback((sectionId: string): void => {
    SpatialNavigation.remove(sectionId);
  }, []);

  const focusSection = useCallback((sectionId: string): void => {
    SpatialNavigation.focus(sectionId);
  }, []);

  const pause = useCallback((): void => {
    SpatialNavigation.pause();
    setRootActive(false);
  }, []);

  const resume = useCallback((): void => {
    SpatialNavigation.resume();
    setRootActive(true);
  }, []);

  const contextValue: SpatialNavigationContextValue = {
    initialized,
    currentSectionId,
    registerSection,
    unregisterSection,
    focusSection,
    pause,
    resume,
    rootActive: rootActive, // Always provide boolean value
  };

  return (
    <SpatialNavigationContext.Provider value={contextValue}>
      {children}
    </SpatialNavigationContext.Provider>
  );
}

/**
 * Hook to access spatial navigation context
 */
export function useSpatialNavigationContext(): SpatialNavigationContextValue {
  const context = useContext(SpatialNavigationContext);
  
  if (!context) {
    throw new Error('useSpatialNavigationContext must be used within SpatialNavigationRoot');
  }
  
  return context;
}

// Backward compatibility: export as SpatialNavigationProvider
export { SpatialNavigationRoot as SpatialNavigationProvider };

