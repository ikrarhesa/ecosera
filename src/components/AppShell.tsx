import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Level-0 paths that should use native body scroll (address bar can shrink)
const LEVEL_0_PATHS = ["/", "/etalase", "/wishlist", "/e-learning"];
const isLevel0 = (pathname: string) =>
    LEVEL_0_PATHS.includes(pathname) || pathname.startsWith("/e-learning/");

/**
 * AppShell wraps the entire app content in a centered mobile-width container.
 * On desktop, the content stays phone-sized with a subtle background.
 * Admin routes bypass this container and render at full width.
 *
 * Level-0 pages (Home, Etalase, Wishlist, E-Learning) use native body scroll
 * so the mobile browser address bar can auto-hide on scroll.
 * Level-1 pages (ProductDetail, Cart, etc.) keep the inner-div scroll stack
 * required for the slide transition animation.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith("/admin");

    // Admin pages manage their own full-width responsive layouts
    if (isAdmin) {
        return <>{children}</>;
    }

    // Level-0: no height cap, no overflow lock → window scrolls natively
    if (isLevel0(pathname)) {
        return (
            <div className="min-h-screen bg-slate-100 flex justify-center" style={{ zIndex: 0 }}>
                <div
                    id="main-app-container"
                    className="w-full max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-[#F6F8FC] shadow-xl relative"
                >
                    {children}
                </div>
            </div>
        );
    }

    // Level-1: keep the fixed-height inner-div stack for slide transitions
    return (
        <div className="min-h-screen bg-slate-100 flex justify-center z-0 overflow-hidden" style={{ zIndex: 0 }}>
            <div
                id="main-app-container"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl h-[100dvh] bg-white shadow-xl relative overflow-hidden"
            >
                {children}
            </div>
        </div>
    );
}
