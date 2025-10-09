import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

const SpatialNavigatorDefaultFocusContext = createContext<boolean>(false);

export const useSpatialNavigatorDefaultFocus = () => {
  const spatialNavigatorDefaultFocus = useContext(SpatialNavigatorDefaultFocusContext);
  return spatialNavigatorDefaultFocus;
};

export type DefaultFocusProps = {
  children?: ComponentChildren;
  enable?: boolean;
};

type Props = DefaultFocusProps;

export const DefaultFocus = ({ children, enable = true }: Props) => {
  return (
    <SpatialNavigatorDefaultFocusContext.Provider value={enable}>
      {children}
    </SpatialNavigatorDefaultFocusContext.Provider>
  );
};

