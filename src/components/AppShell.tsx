import { ReactNode } from "react";

/**
 * AppShell wraps the entire app content in a centered mobile-width container.
 * On desktop, the content stays phone-sized with a subtle background.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-white shadow-xl relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}
