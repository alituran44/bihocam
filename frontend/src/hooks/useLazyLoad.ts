/**
 * EPIC-10: Lazy Loading Hook (EP10-FE-12)
 * 
 * Hook for lazy loading content when it becomes visible
 */

import { useEffect, useRef, useState } from "react";

export interface UseLazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Lazy load content when it enters viewport
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
): [React.RefObject<T>, boolean] {
  const {
    root = null,
    rootMargin = "50px",
    threshold = 0.1,
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (isVisible && triggerOnce)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, triggerOnce, isVisible]);

  return [elementRef, isVisible];
}
