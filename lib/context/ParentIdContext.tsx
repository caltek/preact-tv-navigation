import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const ParentIdContext = createContext<string>('root');

export const useParentId = () => {
  const parentId = useContext(ParentIdContext);
  return parentId;
};

