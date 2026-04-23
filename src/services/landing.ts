import { supabase } from "../lib/supabase";
import { compressImage } from "../lib/imageCompression";
import type { LandingSection } from "../types/landing";

/* ── Public ─────────────────────────────────────────────────────────── */

export async function getActiveLandingSections(): Promise<LandingSection[]> {
    const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching landing sections:", error);
        return [];
    }

    return data || [];
}

/* ── Admin ──────────────────────────────────────────────────────────── */

export async function getAllLandingSections(): Promise<LandingSection[]> {
    const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getLandingSectionById(id: string): Promise<LandingSection | null> {
    const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching landing section:", error);
        return null;
    }

    return data;
}

export async function createLandingSection(
    section: Omit<LandingSection, "id" | "created_at" | "updated_at">
): Promise<LandingSection> {
    const { data, error } = await supabase
        .from("landing_sections")
        .insert(section)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateLandingSection(
    id: string,
    updates: Partial<LandingSection>
): Promise<LandingSection> {
    const { data, error } = await supabase
        .from("landing_sections")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteLandingSection(id: string): Promise<void> {
    const { error } = await supabase
        .from("landing_sections")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function uploadLandingImage(file: File): Promise<string> {
    const compressedFile = await compressImage(file);
    const ext = compressedFile.name.split(".").pop() || "webp";
    const fileName = `landing-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
        .from("banners") // reuse existing bucket
        .upload(fileName, compressedFile, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
