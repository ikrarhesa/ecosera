import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * AppShell wraps the entire app content in a centered mobile-width container.
 * On desktop, the content stays phone-sized with a subtle background.
 * Admin routes bypass this container and render at full width.
 *
 * All pages use native window scroll — no custom scroll containers.
 * Browser's built-in scroll restoration handles back/forward navigation.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();

    // Admin pages manage their own full-width responsive layouts
    if (pathname.startsWith("/admin")) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#F6F8FC] flex justify-center">
            <div
                id="main-app-container"
                className="w-full max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-[#F6F8FC] shadow-xl relative"
            >
                {children}
            </div>
        </div>
    );
}
