import { useCallback } from 'preact/hooks';
import { useSpatialNavigationContext } from '../components/SpatialNavigationRoot';

/**
 * Return type for useLockSpatialNavigation hook
 */
export interface UseLockSpatialNavigationReturn {
  /** Lock spatial navigation (pause) */
  lock: () => void;
  /** Unlock spatial navigation (resume) */
  unlock: () => void;
  /** Check if navigation is currently locked */
  isLocked: () => boolean;
}

/**
 * useLockSpatialNavigation - Hook to lock/unlock spatial navigation
 * Useful for modals, dialogs, or when you want to temporarily disable navigation
 * 
 * @returns Object with lock, unlock, and isLocked functions
 * 
 * @example
 * ```tsx
 * function MyModal() {
 *   const { lock, unlock } = useLockSpatialNavigation();
 *   
 *   useEffect(() => {
 *     lock(); // Lock navigation when modal opens
 *     return () => unlock(); // Unlock when modal closes
 *   }, []);
 *   
 *   return <div>Modal content</div>;
 * }
 * ```
 */
export function useLockSpatialNavigation(): UseLockSpatialNavigationReturn {
  const { pause, resume, rootActive } = useSpatialNavigationContext();

  const lock = useCallback(() => {
    pause();
  }, [pause]);

  const unlock = useCallback(() => {
    resume();
  }, [resume]);

  const isLocked = useCallback(() => {
    return !rootActive;
  }, [rootActive]);

  return {
    lock,
    unlock,
    isLocked,
  };
}

