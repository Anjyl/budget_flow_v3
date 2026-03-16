import { useCallback, useRef } from "react";

export function usePersistFn<T extends (...args: any[]) => any>(fn: T) {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []);
}
