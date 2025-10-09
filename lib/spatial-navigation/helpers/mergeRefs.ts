import type { Ref } from 'preact';

export function mergeRefs<T = any>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as any).current = value;
      }
    });
  };
}

