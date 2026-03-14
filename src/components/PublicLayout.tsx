import React from "react";
import Navbar from "./Navbar";

interface PublicLayoutProps {
    children: React.ReactNode;
}

/**
 * PublicLayout provides the standard navigation elements (Header + Bottom Nav)
 * used for most customer-facing pages.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
