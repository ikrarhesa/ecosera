import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  level?: number; // 0 for base pages (Home, Etalase, etc), 1 for pushed pages (ProductDetail, Cart)
}

export default function PageTransition({ children, level = 0 }: PageTransitionProps) {
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
        className="absolute inset-x-0 top-0 bottom-0 w-full h-full bg-[#F6F8FC] overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 0 }}
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0.99, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }

  // Pushed pages (Cart, ProductDetail) slide in from right and out to right relative to the container (100%)
  return (
    <motion.div
      className="absolute inset-x-0 top-0 bottom-0 w-full h-full bg-[#F6F8FC] overflow-y-auto overflow-x-hidden"
      style={{ 
        zIndex: 50,
        boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
        willChange: "transform"
      }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={transitionConfig}
    >
      {children}
    </motion.div>
  );
}
