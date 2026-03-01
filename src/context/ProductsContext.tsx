import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/products";

interface ProductsContextType {
    products: Product[];
    loading: boolean;
    refresh: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType>({
    products: [],
    loading: true,
    refresh: async () => { },
});

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <ProductsContext.Provider value={{ products, loading, refresh }}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    return useContext(ProductsContext);
}
