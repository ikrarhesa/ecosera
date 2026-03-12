// PageTransition.tsx — no longer used (slide animations removed).
// Kept as a simple passthrough in case it's needed in future.
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  level?: number;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
