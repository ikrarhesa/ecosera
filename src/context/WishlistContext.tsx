import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "../types/product";

interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>(() => {
        try {
            const stored = localStorage.getItem("ecosera_wishlist");
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to load wishlist from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("ecosera_wishlist", JSON.stringify(wishlist));
        } catch (error) {
            console.error("Failed to save wishlist to localStorage", error);
        }
    }, [wishlist]);

    const toggleWishlist = (product: Product) => {
        setWishlist((current) => {
            const exists = current.some((p) => p.id === product.id);
            if (exists) {
                return current.filter((p) => p.id !== product.id);
            } else {
                return [...current, product];
            }
        });
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
