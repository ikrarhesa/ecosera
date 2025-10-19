export const SHOP_NAME = import.meta.env.VITE_SHOP_NAME ?? "Ecosera – UMKM Muara Enim";
export const SHOP_WA   = import.meta.env.VITE_SHOP_WA   ?? "";

export function assertEnv() {
  if (!SHOP_WA || !/^\d{9,15}$/.test(SHOP_WA)) {
    console.warn("VITE_SHOP_WA is missing or invalid. Set it in .env to enable WhatsApp checkout.");
  }
}
