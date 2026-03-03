import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    BarChart3,
    Store,
    Megaphone,
    TrendingUp,
    LogOut,
    Menu,
    X,
} from "lucide-react";

/* ── Walmart‑inspired palette ─────────────────────────────────────── */
const C = {
    blue: "#0071DC",
    blueDark: "#004C91",
    blueLight: "#E6F1FB",
    yellow: "#FFC220",
    navy: "#041E42",
    bg: "#F5F6F8",
    white: "#FFFFFF",
};

/* ── Nav items ────────────────────────────────────────────────────── */
const navItems = [
    { label: "Dashboard", to: "/admin", icon: BarChart3, end: true },
    { label: "Kelola Toko", to: "/admin/shops", icon: Store },
    { label: "Kelola Promo", to: "/admin/marketing", icon: Megaphone },
    { label: "Kelola Trending", to: "/admin/trending", icon: TrendingUp },
];

export default function AdminLayout() {
    const { pathname } = useLocation();
    const { signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (to: string, end?: boolean) =>
        end ? pathname === to : pathname.startsWith(to);

    const handleLogout = async () => {
        await signOut();
    };

    /* ── Sidebar content (shared between mobile drawer & desktop) ── */
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200/60">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                    style={{ backgroundColor: C.blue }}
                >
                    E
                </div>
                <div>
                    <p className="font-bold text-sm" style={{ color: C.navy }}>
                        Ecosera
                    </p>
                    <p className="text-[11px] text-slate-500">Admin Portal</p>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isActive(item.to, item.end);
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${active
                                ? "text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            style={
                                active
                                    ? { backgroundColor: C.blue }
                                    : undefined
                            }
                        >
                            <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-3 pb-5 space-y-1 border-t border-slate-200/60 pt-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Keluar
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: C.bg }}>
            {/* ── Mobile overlay ──────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar (mobile drawer) ─────────────────────────────  */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200/80 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                    <X className="h-5 w-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* ── Sidebar (desktop) ───────────────────────────────────  */}
            <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30">
                <SidebarContent />
            </aside>

            {/* ── Main content ────────────────────────────────────────  */}
            <div className="flex-1 lg:pl-[260px] min-h-screen">
                {/* Mobile topbar */}
                <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white text-xs"
                            style={{ backgroundColor: C.blue }}
                        >
                            E
                        </div>
                        <span className="font-semibold text-sm" style={{ color: C.navy }}>
                            Ecosera Admin
                        </span>
                    </div>
                </div>

                {/* Page content (rendered via Outlet) */}
                <main className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
