/**
 * Return type for useLockSpatialNavigation hook
 */
export interface UseLockSpatialNavigationReturn {
  /** Lock spatial navigation (pause) */
  lock: () => void;
  /** Unlock spatial navigation (resume) */
  unlock: () => void;
}

// Re-export from the context
export { useLockSpatialNavigation } from '../context/LockSpatialNavigationContext';
