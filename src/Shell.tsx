// src/components/Shell.tsx
import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col">
      <div className="flex-1 pb-16">{children}</div>
      <Navbar />
    </div>
  );
}
