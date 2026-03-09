import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * AppShell wraps the entire app content in a centered mobile-width container.
 * On desktop, the content stays phone-sized with a subtle background.
 * Admin routes bypass this container and render at full width.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith("/admin");

    // Admin pages manage their own full-width responsive layouts
    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-slate-100 flex justify-center z-0" style={{ zIndex: 0 }}>
            {/* The main phone layout wrapper - strict overflow hidden so sliders are perfectly clipped */}
            <div 
                id="main-scroll-container"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl h-full bg-white shadow-xl relative overflow-hidden"
            >
                {children}
            </div>
        </div>
    );
}
