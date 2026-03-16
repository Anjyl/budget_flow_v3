import { useCallback, useMemo } from "react";

type UseCompositionOptions<T extends HTMLElement> = {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
};

export function useComposition<T extends HTMLElement = HTMLElement>(options: UseCompositionOptions<T>) {
  return useMemo(() => {
    return {
      onKeyDown: options.onKeyDown,
      onCompositionStart: options.onCompositionStart,
      onCompositionEnd: options.onCompositionEnd,
    };
  }, [options]);
}
