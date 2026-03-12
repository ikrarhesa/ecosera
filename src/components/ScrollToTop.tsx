import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to the top of the page on PUSH navigations (new page visits).
 * POP navigations (back/forward) are left to the browser's native
 * scrollRestoration = 'auto', which handles them correctly.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, navType]);

  return null;
}
