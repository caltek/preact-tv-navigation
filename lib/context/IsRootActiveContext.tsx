import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const IsRootActiveContext = createContext<boolean>(true);

export const useIsRootActive = () => {
  const isRootActive = useContext(IsRootActiveContext);
  return isRootActive;
};

