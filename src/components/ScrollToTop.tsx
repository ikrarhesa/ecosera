import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType !== "POP") {
      const scrollContainer = document.getElementById('main-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, navType]);

  return null;
}
