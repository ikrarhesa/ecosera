import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Track paths globally to determine how pages should animate
let previousPath = "";
let currentPath = typeof window !== "undefined" ? window.location.pathname : "";

interface PageTransitionProps {
  children: ReactNode;
  level?: number; // 0 for base pages (Home, Etalase, etc), 1 for pushed pages (ProductDetail, Cart)
}

export default function PageTransition({ children, level = 0 }: PageTransitionProps) {
  const location = useLocation();
  if (location.pathname !== currentPath) {
    previousPath = currentPath;
    currentPath = location.pathname;
  }

  // Baseline transition config
  const transitionConfig = {
    type: "tween" as const,
    duration: 0.38,
    ease: [0.25, 1, 0.5, 1] as [number, number, number, number] // Smooth deceleration
  };

  // Base pages (Home, Etalase) should stay completely static while the pushed pages slide over them.
  if (level === 0) {
    return (
      <motion.div
        className="w-full min-h-screen bg-[#F6F8FC] overflow-x-hidden"
        style={{ 
          position: "relative",
          zIndex: 0 
        }}
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0.99, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }

  // Pushed pages (Cart, ProductDetail)
  const slideVariants = {
    initial: () => {
      // If coming FROM the search page to a pushed page (ProductDetail)
      // fade in rather than slide in from the right edge.
      if (previousPath.startsWith('/search')) {
        return { opacity: 0, x: 0 };
      }
      return { opacity: 1, x: "100%" };
    },
    animate: { x: 0, opacity: 1 },
    exit: () => {
      // If navigating TO the search page from a pushed page
      // fade out rather than slide out to the right edge.
      if (window.location.pathname.startsWith('/search')) {
        return { opacity: 0, transition: { duration: 0.2 } };
      }
      return { opacity: 1, x: "100%" };
    }
  };

  return (
    <motion.div
      className="w-full min-h-screen bg-[#F6F8FC] overflow-x-hidden"
      style={{ 
        position: "relative",
        zIndex: 50,
        boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
        willChange: "transform"
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
