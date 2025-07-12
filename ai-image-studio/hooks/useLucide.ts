
import { useLayoutEffect } from 'react';

export const useLucide = (deps: any[] = []) => {
  useLayoutEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, deps);
};
