export interface LandingSection {
    id: string;
    section_key: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    cta_text: string | null;
    cta_link: string | null;
    badge_text: string | null;
    badge_icon: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}
