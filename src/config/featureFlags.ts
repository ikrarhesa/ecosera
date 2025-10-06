export const FEATURE_PILIHAN_TITLE_VARIANT: 'A' | 'B' =
  // Choose 'A' to show "Pilihan {Daerah}", 'B' to show "Andalan Hari Ini"
  (typeof window !== 'undefined' && (window as any).__PILIHAN_TITLE_VARIANT__) || 'A';
