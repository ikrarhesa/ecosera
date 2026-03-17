import { supabase } from '../lib/supabase';
import { isBrowser } from '../utils/dom';

/**
 * Analytics Service
 * Centralizes all event logging and custom browser events.
 */

export interface AnalyticsDetail {
  [key: string]: any;
}

/**
 * Dispatches a custom event in the browser for frontend-specific logic/tracking.
 */
export function trackBrowserEvent(eventName: string, detail: AnalyticsDetail): void {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

/**
 * Logs an event to the backend (Supabase event_logs).
 */
export async function logEvent(
  eventType: string,
  params: { product_id?: string | null; seller_id?: string | null; [key: string]: any }
): Promise<void> {
  try {
    const { error } = await supabase.from('event_logs').insert({
      event_type: eventType,
      ...params,
    });
    if (error) {
      console.error(`[Analytics] ${eventType} insert error:`, error.message, error.details);
    }
  } catch (err) {
    console.error(`[Analytics] Unexpected ${eventType} error:`, err);
  }
}

/**
 * Preset common events for convenience and type safety
 */
export const analytics = {
  // Pilihan Daerah Events
  pilihan: {
    view: (detail: { region_label: string; items_shown: number; tab: string }) =>
      trackBrowserEvent('pilihan_view', detail),
    impression: (detail: { item_id: string; tab: string; region_label: string }) =>
      trackBrowserEvent('pilihan_impression', detail),
    tabSwitch: (detail: { from: string; to: string }) =>
      trackBrowserEvent('pilihan_tab_switch', detail),
    clickAdd: (detail: { item_id: string; tab: string; region_label: string }) =>
      trackBrowserEvent('pilihan_click_add', detail),
    clickChat: (detail: { item_id: string; tab: string; region_label: string }) =>
      trackBrowserEvent('pilihan_click_chat', detail),
    retry: (detail: { tab: string }) =>
      trackBrowserEvent('pilihan_retry', detail),
    bundlesView: (detail: { region_label: string }) =>
      trackBrowserEvent('pilihan_bundles_view', detail),
    bundleAddAll: (detail: { bundle_id: string; region_label: string; item_ids: string[] }) =>
      trackBrowserEvent('pilihan_bundle_add_all', detail),
  },

  // Product Events
  product: {
    view: (productId: string, sellerId?: string | null) =>
      logEvent('product_view', { product_id: productId, seller_id: sellerId }),
    waClick: (productId: string, sellerId?: string | null) =>
      logEvent('wa_click', { product_id: productId, seller_id: sellerId }),
  },

  // Search Events
  search: {
    perform: (query: string, resultsCount: number) =>
      logEvent('search_perform', { search_query: query, results_count: resultsCount }),
  },

  // Banner Events
  banner: {
    impression: (bannerId: string, bannerTitle: string) =>
      logEvent('banner_impression', { banner_id: bannerId, banner_title: bannerTitle }),
    click: (bannerId: string, bannerTitle: string, linkUrl?: string) =>
      logEvent('banner_click', { banner_id: bannerId, banner_title: bannerTitle, link_url: linkUrl }),
  },
};
