import { supabase } from "../lib/supabase";

export interface Category {
    id: string;
    name: string;
}

let categoryCache: Category[] | null = null;

export function getCachedCategories(): Category[] | null {
    return categoryCache;
}

export async function getCategories(): Promise<Category[]> {
    if (categoryCache) {
        // Still fetch in background to keep it fresh
        supabase.from("categories").select("*").order("name").then(({ data, error }) => {
            if (!error && data) categoryCache = data;
        });
        return categoryCache;
    }

    const { data, error } = await supabase.from("categories").select("*").order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    categoryCache = data || [];
    return categoryCache;
}
