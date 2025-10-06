/**
 * PilihanDaerahStrip Component
 * 
 * V1 server-side tab fetch implementation.
 * Region is resolved locally via coarse boxes and can be replaced later by server reverse geocode.
 * Snackbar appears when distance delta ≥ 5 km and only after the first successful fetch with new region.
 * Future step: add debounce for rapid tab presses and error toast.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchPilihanDaerah } from '../services/pilihanDaerah';
import { formatCurrencyIDR, km } from '../utils/format';
import { haversineKm } from '../utils/geo';
import { isOnline, onOnlineOnce } from '../utils/net';
import { isBrowser } from '../utils/dom';
import { FEATURE_PILIHAN_TITLE_VARIANT } from '../config/featureFlags';
import { getStarterBundles } from '../services/starterBundles';
import { resolveRegionLabel } from '../services/geoRegion';
import type { PilihanResponse, PilihanItem, PilihanTab } from '../types/pilihanDaerah';

export interface PilihanDaerahStripProps {
  userId?: string;
  lat?: number;
  lng?: number;
  regionLabelOverride?: string;
  className?: string;
  onAdd?: (itemId: string) => void; // parent can handle add-to-cart
}

const TabToReason: Record<string, 'order_again' | 'staple' | 'nearby'> = {
  'Beli Lagi': 'order_again',
  'Kebutuhan Pokok': 'staple',
  'Dekat Kamu': 'nearby',
};

const ReasonToLabel: Record<'order_again' | 'staple' | 'nearby', string> = {
  order_again: 'Beli Lagi',
  staple: 'Kebutuhan Pokok',
  nearby: 'Dekat',
};

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="%23e5e7eb"/></svg>';

// WhatsApp link security helpers
function sanitizePhoneE164ish(raw?: string): string {
  if (!raw) return '';
  // keep digits only
  const digits = raw.replace(/\D+/g, '');
  // optionally normalize leading 0 to 62 for IDN, but KEEP SIMPLE: just return digits
  return digits;
}

function sanitizePrefill(raw?: string, region?: string): string {
  const base = (raw && typeof raw === 'string' ? raw : '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
  const withRegion = region ? (base.length ? base + '\n(Area: ' + region + ')' : '(Area: ' + region + ')') : base;
  // cap to 500 chars to avoid absurd URLs
  return withRegion.slice(0, 500);
}

function buildSafeWaHref(phoneRaw?: string, textRaw?: string) {
  const phone = sanitizePhoneE164ish(phoneRaw);
  const text = sanitizePrefill(textRaw);
  if (!phone) return null; // invalid, avoid rendering broken link
  const url = 'https://wa.me/' + phone + (text ? ('?text=' + encodeURIComponent(text)) : '');
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.hostname !== 'wa.me') return null;
    return u.toString();
  } catch {
    return null;
  }
}

export default function PilihanDaerahStrip(props: PilihanDaerahStripProps): JSX.Element {
  const [data, setData] = useState<PilihanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'order_again' | 'staple' | 'nearby'>('order_again');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [refetchNonce, setRefetchNonce] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const shouldShowLocationSnackbarRef = useRef(false);
  
  // Impression tracking refs
  const seenImpressionsRef = useRef<Set<string>>(new Set()); // keys: `${activeTab}:${item.id}`
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pendingImpressionsRef = useRef<Array<{ id: string; tab: 'order_again'|'staple'|'nearby'; region: string }>>([]);
  const throttleTimerRef = useRef<number | null>(null);

  // Throttled impression dispatch - impressions are per-tab and fire once per item when ≥50% visible
  function flushImpressionsThrottled() {
    if (throttleTimerRef.current != null) return;
    throttleTimerRef.current = window.setTimeout(() => {
      const batch = pendingImpressionsRef.current.splice(0, pendingImpressionsRef.current.length);
      throttleTimerRef.current = null;
      if (batch.length) {
        for (const it of batch) {
          window.dispatchEvent(
            new CustomEvent('pilihan_impression', {
              detail: { item_id: it.id, tab: it.tab, region_label: it.region },
            })
          );
        }
      }
    }, 200);
  }


  // Last location persistence
  const storage = isBrowser() ? window.localStorage : undefined;
  function readLastLoc() {
    try {
      const raw = storage?.getItem('pilihan_last_loc');
      return raw ? JSON.parse(raw) as { lat: number; lng: number; region: string } : null;
    } catch { return null; }
  }
  function writeLastLoc(lat: number, lng: number, region: string) {
    try { storage?.setItem('pilihan_last_loc', JSON.stringify({ lat, lng, region })); } catch {}
  }

  // Initialize activeTab from localStorage on mount
  useEffect(() => {
    const storage = isBrowser() ? window.localStorage : undefined;
    if (storage) {
      try {
        const saved = storage.getItem('pilihan_last_tab');
        if (saved && ['order_again', 'staple', 'nearby'].includes(saved)) {
          setActiveTab(saved as 'order_again' | 'staple' | 'nearby');
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, []);

  // Fetch data when activeTab changes
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Abort previous request
        if (abortRef.current) {
          abortRef.current.abort();
        }

        setLoading(true);
        setError(null);
        
        // Create new abort controller
        const controller = new AbortController();
        abortRef.current = controller;

        // Resolve region param for fetch
        const localRegion = props.regionLabelOverride
          ? props.regionLabelOverride
          : resolveRegionLabel(props.lat, props.lng);

        // Detect significant location change
        const last = readLastLoc();
        const hasCoords = typeof props.lat === 'number' && typeof props.lng === 'number';
        if (hasCoords) {
          if (last) {
            const dist = haversineKm(last.lat, last.lng, props.lat!, props.lng!);
            // threshold 5 km
            if (dist >= 5) {
              // After fetch succeeds, show snackbar with new data region label
              // so message aligns with the actual rendered region
              // Set a flag, then after setData(...) setSnackbar(...)
              shouldShowLocationSnackbarRef.current = true;
            }
          } else {
            // First time save but no snackbar
            writeLastLoc(props.lat!, props.lng!, localRegion);
          }
        }

        const response = await fetchPilihanDaerah({
          lat: props.lat,
          lng: props.lng,
          userId: props.userId,
          region: localRegion,
          tab: activeTab,
          signal: controller.signal
        });

        if (mounted && !controller.signal.aborted) {
          setData(response);
          
          // Dispatch view event
          if (isBrowser()) {
            window.dispatchEvent(new CustomEvent('pilihan_view', {
              detail: {
                region_label: response.region_label,
                items_shown: response.items.length,
                tab: response.tab
              }
            }));
          }


          // Persist activeTab to localStorage
          const storage = isBrowser() ? window.localStorage : undefined;
          if (storage) {
            try {
              storage.setItem('pilihan_last_tab', activeTab);
            } catch (e) {
              // Ignore localStorage errors
            }
          }

          // Handle location change snackbar
          if (hasCoords) {
            writeLastLoc(props.lat!, props.lng!, response.region_label || localRegion);
            if (shouldShowLocationSnackbarRef.current) {
              shouldShowLocationSnackbarRef.current = false;
              setSnackbar(`Lokasi berganti ke ${response.region_label || localRegion}. Menampilkan Pilihan ${response.region_label || localRegion}.`);
            }
          }
        }
      } catch (err) {
        if (mounted && !abortRef.current?.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Gagal memuat');
          setLoading(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [activeTab, props.lat, props.lng, props.userId, props.regionLabelOverride, refetchNonce]);

  // Card ref map for IntersectionObserver
  const cardRefMap = useRef(new Map<string, Element>());

  function setCardRef(key: string) {
    return (el: Element | null) => {
      const map = cardRefMap.current;
      if (el) {
        map.set(key, el);
        if (observerRef.current) observerRef.current.observe(el);
      } else {
        const old = map.get(key);
        if (old && observerRef.current) observerRef.current.unobserve(old);
        map.delete(key);
      }
    };
  }

  // IntersectionObserver effect for impression tracking
  useEffect(() => {
    // Reset seen set per tab view
    seenImpressionsRef.current.clear();

    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      // Clean up any previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const hasIO = isBrowser() && 'IntersectionObserver' in window;
    const region = data.region_label || 'Sekitar Kamu';

    if (!hasIO) {
      // Fallback: immediate impression dispatch once per item
      data.items.forEach(item => {
        const key = `${activeTab}:${item.id}`;
        if (!seenImpressionsRef.current.has(key)) {
          seenImpressionsRef.current.add(key);
          pendingImpressionsRef.current.push({ id: item.id, tab: activeTab, region });
        }
      });
      flushImpressionsThrottled();
      return;
    }

    // Build observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            const key = [...cardRefMap.current.entries()].find(([, el]) => el === e.target)?.[0];
            if (!key) continue;
            if (seenImpressionsRef.current.has(key)) continue;
            seenImpressionsRef.current.add(key);
            const [, itemId] = key.split(':') as [string, string];
            pendingImpressionsRef.current.push({ id: itemId, tab: activeTab, region });
          }
        }
        flushImpressionsThrottled();
      },
      { threshold: [0.5] }
    );

    // Observe current cards
    for (const [, el] of cardRefMap.current.entries()) {
      observerRef.current.observe(el);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      // Clear pending throttle timer
      if (throttleTimerRef.current != null) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      pendingImpressionsRef.current.length = 0;
    };
  }, [activeTab, data]);

  // Handle tab switch
  const handleTabSwitch = (newTab: 'order_again' | 'staple' | 'nearby') => {
    const oldTab = activeTab;
    setActiveTab(newTab);
    
    // Dispatch tab switch event
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent('pilihan_tab_switch', {
        detail: { from: oldTab, to: newTab }
      }));
    }
  };

  // Handle add to cart
  const handleAdd = (item: PilihanItem) => {
    props.onAdd?.(item.id);
    
    // Dispatch add event
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent('pilihan_click_add', {
        detail: {
          item_id: item.id,
          tab: activeTab,
          region_label: data?.region_label || 'Unknown'
        }
      }));
    }
  };

  // Handle chat
  const handleChat = (item: PilihanItem) => {
    const regionLabel = data?.region_label || props.regionLabelOverride || '';
    const prefill = item.prefill_chat && item.prefill_chat.trim()
      ? item.prefill_chat
      : `Halo, saya mau pesan 1 × ${item.name || 'Produk'}. Bisa ambil hari ini? Terima kasih.`;
    const href = buildSafeWaHref(item.seller?.wa, prefill && regionLabel ? (prefill + '\n(Area: ' + regionLabel + ')') : prefill);

    if (href) {
      if (isBrowser()) {
        window.dispatchEvent(new CustomEvent('pilihan_click_chat', { 
          detail: { item_id: item.id, tab: activeTab, region_label: regionLabel } 
        }));
        // open in new tab safely
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    } else {
      if (isBrowser()) {
        console.warn('[pilihan] WA link invalid');
      }
    }
  };


  // Use items directly from data (no client-side filtering)
  const items = data?.items || [];

  // Compute title based on A/B variant
  const region = data?.region_label || props.regionLabelOverride || 'Sekitar Kamu';
  const title = FEATURE_PILIHAN_TITLE_VARIANT === 'B'
    ? 'Andalan Hari Ini'
    : `Pilihan ${region}`;

  // Render loading skeleton
  if (loading) {
    return (
      <div className={`px-4 py-3 ${props.className || ''}`}>
        <div className="text-base font-semibold text-slate-900 mb-2">
          Pilihan Daerah
        </div>
        <div className="text-xs text-slate-600 mb-2">
          Memuat produk...
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[156px] shrink-0 rounded-xl border border-slate-200 bg-white p-2">
              <div className="w-full aspect-square rounded-lg bg-slate-100 animate-pulse" />
              <div className="mt-2 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="mt-1 h-3 bg-slate-200 rounded animate-pulse w-2/3" />
              <div className="mt-2 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !data) {
    return (
      <div className={`px-4 py-3 ${props.className || ''}`}>
        <div className="text-base font-semibold text-slate-900 mb-2">
          Pilihan Daerah
        </div>
        <div className="text-xs text-slate-600">
          Tidak dapat memuat produk saat ini.
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 ${props.className || ''}`}>
      {/* Header */}
      <div className="text-base font-semibold text-slate-900">
        {title}
      </div>
      <div className="text-xs text-slate-600 mb-2">
        Produk yang pas dibeli sekarang, dari penjual terdekat.
      </div>

      {/* Error Banner */}
      {error && (
        <div role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
          <button
            className="ml-3 underline"
            onClick={() => {
              setError(null);
              setRefetchNonce((n) => n + 1);
              
              // Dispatch retry event
              if (isBrowser()) {
                window.dispatchEvent(new CustomEvent('pilihan_retry', {
                  detail: { tab: activeTab }
                }));
              }
            }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-2" role="tablist">
        {(['order_again', 'staple', 'nearby'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => handleTabSwitch(tab)}
            className={`h-8 px-3 rounded-full border text-sm font-medium ${
              activeTab === tab
                ? 'bg-[#2254C5] text-white border-transparent'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {ReasonToLabel[tab]}
          </button>
        ))}
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="mt-2 grid gap-2">
          {(() => {
            const bundles = getStarterBundles(region);
            
            // Dispatch bundles view event once
            React.useEffect(() => {
              if (isBrowser()) {
                window.dispatchEvent(new CustomEvent('pilihan_bundles_view', { 
                  detail: { region_label: region } 
                }));
              }
            }, []);

            return bundles.map(bundle => (
              <div key={bundle.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-sm font-semibold text-slate-900 mb-2">
                  {bundle.title}
                </div>
                <div className="space-y-1">
                  {bundle.items.map(item => (
                    <div key={item.id} className="text-xs text-slate-700">
                      {item.name} - {formatCurrencyIDR(item.price)}{item.unit}
                    </div>
                  ))}
                </div>
                <button
                  className="mt-2 h-9 w-full rounded-lg bg-[#2254C5] text-white text-sm font-medium"
                  onClick={() => {
                    // Add all items to cart
                    bundle.items.forEach(item => {
                      props.onAdd?.(item.id);
                    });
                    
                    // Dispatch analytics event
                    if (isBrowser()) {
                      window.dispatchEvent(new CustomEvent('pilihan_bundle_add_all', {
                        detail: {
                          bundle_id: bundle.id,
                          region_label: region,
                          item_ids: bundle.items.map(i => i.id)
                        }
                      }));
                    }
                    
                    // Optional toast
                    if (isBrowser() && (window as any).toast) {
                      (window as any).toast(`Ditambahkan ${bundle.items.length} item ke keranjang`);
                    } else if (isBrowser()) {
                      console.log('[pilihan] bundle ditambahkan:', bundle.id);
                    }
                  }}
                >
                  Tambah Semua
                </button>
              </div>
            ));
          })()}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {items.slice(0, 6).map(item => {
            const [imgLoading, setImgLoading] = useState(true);
            
            return (
              <div
                key={item.id}
                className="w-[156px] shrink-0 rounded-xl border border-slate-200 bg-white p-2"
                ref={setCardRef(`${activeTab}:${item.id}`)}
              >
                {/* Image */}
                <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden">
                  <img
                    src={item.image?.trim() || FALLBACK_IMG}
                    srcSet={
                      item.image
                        ? `${item.image.trim()} 1x, ${item.image.trim()} 2x`
                        : undefined
                    }
                    alt={item.name || 'Produk'}
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImgLoading(false)}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.src = FALLBACK_IMG;
                      el.removeAttribute('srcset');
                      setImgLoading(false);
                    }}
                    className={[
                      'h-full w-full object-cover',
                      'transition duration-300',
                      imgLoading ? 'blur-[6px] scale-[1.02]' : 'blur-0 scale-100',
                    ].join(' ')}
                  />
                </div>

              {/* Name */}
              <div className="mt-2 text-sm line-clamp-2 text-slate-900">
                {item.name}
              </div>

              {/* Price and Unit */}
              <div className="mt-1 flex items-baseline">
                <span className="text-sm font-semibold">
                  {formatCurrencyIDR(item.price)}
                </span>
                <span className="text-xs text-slate-600 ml-1">
                  {item.unit}
                </span>
              </div>

              {/* Stock */}
              <div className="text-[11px] text-slate-600">
                {item.stock === null ? 'Preorder' : `Stok: ${item.stock}`}
              </div>

              {/* Reason Badge */}
              <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {ReasonToLabel[item.reason]}
                {item.reason === 'nearby' && item.distance_km && ` ${km(item.distance_km)}`}
              </div>

              {/* Actions */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAdd(item)}
                  aria-label={`Tambah ${item.name || 'Produk'}`}
                  className="h-8 rounded-lg text-sm font-medium border bg-[#2254C5] text-white border-transparent"
                >
                  Tambah
                </button>
                <button
                  onClick={() => handleChat(item)}
                  aria-label={`Chat ${item.seller?.name || 'penjual'}`}
                  className="h-8 rounded-lg text-sm font-medium border bg-white text-slate-900 border-slate-200"
                >
                  Chat
                </button>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location Change Snackbar */}
      {snackbar && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-3 mx-auto w-fit max-w-[92%] rounded-full bg-black/80 px-4 py-2 text-xs text-white shadow-lg"
        >
          {snackbar}
          <button
            className="ml-3 underline"
            aria-label="Tutup notifikasi lokasi"
            onClick={() => setSnackbar(null)}
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
