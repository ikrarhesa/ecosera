import { supabase } from "../lib/supabase";

export interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url?: string;
    cta_text?: string;
    text_color?: 'white' | 'navy';
    overlay_color?: string;
    overlay_opacity?: number;
    is_active: boolean;
    sort_order: number;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
}

let activeBannersCache: Banner[] | null = null;
export function getCachedActiveBanners(): Banner[] | null {
    return activeBannersCache;
}

export async function getActiveBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(4);

    if (error) {
        console.error("Error fetching banners:", error);
        return activeBannersCache || [];
    }

    activeBannersCache = data || [];
    return activeBannersCache;
}

export async function getBannerById(id: string): Promise<Banner | null> {
    const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching banner:", error);
        return null;
    }

    return data;
}

export async function getAllBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createBanner(bannerData: Omit<Banner, "id" | "created_at">): Promise<Banner> {
    const { data, error } = await supabase
        .from("banners")
        .insert(bannerData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    const { data, error } = await supabase
        .from("banners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteBanner(id: string): Promise<void> {
    const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function uploadBannerImage(file: File): Promise<string> {
    // Generate a unique filename using timestamp and original extension
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `banner-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
