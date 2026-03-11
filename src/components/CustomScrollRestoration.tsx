import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Custom scroll restoration for the AppShell's #main-scroll-container.
 * React Router's <ScrollRestoration> only works on the window object.
 */
export default function CustomScrollRestoration() {
    const location = useLocation();
    const navigationType = useNavigationType();
    const scrollPositions = useRef<Record<string, number>>({});

    useEffect(() => {
        const container = document.getElementById('main-scroll-container');
        if (!container) return;

        // Save scroll position on unmount or before location change
        const handleScroll = () => {
            scrollPositions.current[location.key] = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.key]);

    useEffect(() => {
        if (navigationType === 'POP') {
            // Restore previous scroll position when navigating back
            const savedPosition = scrollPositions.current[location.key];
            if (savedPosition !== undefined) {
                // Small delay to ensure the DOM has rendered the incoming page (framer-motion delays it slightly)
                requestAnimationFrame(() => {
                    window.scrollTo(0, savedPosition);
                });
            }
        } else {
            // Reset to top for new navigations (PUSH/REPLACE)
            // Exception: Don't scroll to top if the target page manages its own scroll (e.g. ProductDetail handles it)
            if (!location.pathname.startsWith('/product/')) {
                requestAnimationFrame(() => {
                    window.scrollTo(0, 0);
                });
            }
        }
    }, [location.key, location.pathname, navigationType]);

    return null;
}
