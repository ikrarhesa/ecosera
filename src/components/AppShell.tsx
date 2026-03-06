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
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-white shadow-xl relative">
                {children}
            </div>
        </div>
    );
}
