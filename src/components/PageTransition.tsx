import { motion, usePresence } from "framer-motion";
import { ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Track paths globally to determine how pages should animate
let previousPath = "";
let currentPath = typeof window !== "undefined" ? window.location.pathname : "";

// Track scroll positions for each route instance independently
const scrollMap = new Map<string, number>();

interface PageTransitionProps {
  children: ReactNode;
  level?: number; // 0 for base pages (Home, Etalase, etc), 1 for pushed pages (ProductDetail, Cart)
}

export default function PageTransition({ children, level = 0 }: PageTransitionProps) {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPresent] = usePresence();

  if (location.pathname !== currentPath) {
    previousPath = currentPath;
    currentPath = location.pathname;
  }

  // Handle scroll restoration — branches on level to choose native vs inner-div scroll
  useEffect(() => {
    if (level === 0) {
      // Native window scroll (level-0 pages)
      if (navType === "POP") {
        const saved = scrollMap.get(location.key) || 0;
        const attemptScroll = () => window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
        attemptScroll();
        requestAnimationFrame(() => {
          attemptScroll();
          setTimeout(attemptScroll, 50);
          setTimeout(attemptScroll, 150);
        });
      } else {
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
      }

      const handleScroll = () => {
        if (isPresent) {
          scrollMap.set(location.key, window.scrollY);
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      // Inner-div scroll (level-1 pages)
      const el = scrollRef.current;
      if (!el) return;

      if (navType === "POP") {
        const saved = scrollMap.get(location.key) || 0;

        // Cascade scroll restoration to account for React taking a moment to fully paint DOM heights
        const attemptScroll = () => {
          if (el && el.scrollHeight > saved) {
            el.scrollTop = saved;
          } else if (el) {
            el.scrollTop = saved;
          }
        };

        attemptScroll();
        requestAnimationFrame(() => {
          attemptScroll();
          setTimeout(attemptScroll, 10);
          setTimeout(attemptScroll, 50);
          setTimeout(attemptScroll, 100);
        });
      } else {
        requestAnimationFrame(() => {
          if (el) el.scrollTop = 0;
        });
      }

      const handleScroll = (e: Event) => {
        if (isPresent) {
          const target = e.target as HTMLElement;
          scrollMap.set(location.key, target.scrollTop);
        }
      };

      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [level, location.key, navType]);

  // Baseline transition config
  const transitionConfig = {
    type: "tween" as const,
    duration: 0.38,
    ease: [0.25, 1, 0.5, 1] as [number, number, number, number] // Smooth deceleration
  };

  // Base pages — use native window scroll so the browser address bar can shrink
  if (level === 0) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.99 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }

  // Pushed pages wrapper
  const slideVariants = {
    initial: () => {
      if (previousPath.startsWith('/search')) return { opacity: 0, x: 0 };
      return { opacity: 1, x: "100%" };
    },
    animate: { x: 0, opacity: 1 },
    exit: () => {
      if (window.location.pathname.startsWith('/search')) return { opacity: 0, transition: { duration: 0.2 } };
      return { opacity: 1, x: "100%" };
    }
  };

  return (
    <motion.div
      ref={scrollRef}
      className="absolute inset-0 w-full h-full bg-white overflow-y-auto overflow-x-hidden z-50 pointer-events-auto"
      style={{
        boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
        willChange: "transform",
        WebkitOverflowScrolling: "touch"
      }}
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={window.location.pathname}
      transition={transitionConfig}
    >
      {children}
    </motion.div>
  );
}
