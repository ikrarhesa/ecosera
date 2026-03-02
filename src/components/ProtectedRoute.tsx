import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600">Memuat…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
