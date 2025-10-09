import SpatialNavigator from '../spatial-navigation/SpatialNavigator';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const SpatialNavigatorContext = createContext<SpatialNavigator | null>(null);

export const useSpatialNavigator = () => {
  const spatialNavigator = useContext(SpatialNavigatorContext);
  if (!spatialNavigator)
    throw new Error(
      'No registered spatial navigator on this page. Use the <SpatialNavigationRoot /> component.',
    );
  return spatialNavigator;
};

// Alias for backward compatibility
export { useSpatialNavigator as useSpatialNavigatorContext };

