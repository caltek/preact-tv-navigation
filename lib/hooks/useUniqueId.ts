import { useRef } from 'preact/hooks';
import uniqueId from 'lodash.uniqueid';

export const useUniqueId = ({ prefix }: { prefix: string }) => {
  const id = useRef<string | null>(null);

  if (id.current === null) {
    id.current = uniqueId(prefix);
  }

  return id.current;
};

