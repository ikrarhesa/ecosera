import { supabase } from "../lib/supabase";

export interface SoughtAfterItem {
    id?: string;
    position: number;
    title: string;
    image_url: string;
    link_url?: string;
    created_at?: string;
    updated_at?: string;
}

export async function getSoughtAfterItems(): Promise<SoughtAfterItem[]> {
    const { data, error } = await supabase
        .from("sought_after_items")
        .select("*")
        .order("position", { ascending: true });

    if (error) {
        console.error("Error fetching sought after items:", error);
        return [];
    }

    return data || [];
}

export async function upsertSoughtAfterItem(item: Omit<SoughtAfterItem, "id" | "created_at" | "updated_at">): Promise<void> {
    const { error } = await supabase
        .from("sought_after_items")
        .upsert(
            {
                position: item.position,
                title: item.title,
                image_url: item.image_url,
                link_url: item.link_url
            },
            { onConflict: 'position' }
        );

    if (error) throw error;
}

export async function uploadSoughtAfterImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `sought-after-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage
        .from("banners")
        .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
