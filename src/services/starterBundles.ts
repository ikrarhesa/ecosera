export interface StarterBundleItem {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface StarterBundle {
  id: string;
  title: string; // e.g., "Paket Sarapan", "Paket Dapur"
  items: StarterBundleItem[];
}

// Tiny helper that returns 3 bundles based on a region label
export function getStarterBundles(regionLabel?: string): StarterBundle[] {
  const region = (regionLabel || 'Sekitar Kamu').trim();
  return [
    {
      id: 'bundle_1',
      title: `Paket Sarapan • ${region}`,
      items: [
        { id: 'rb_roti', name: 'Roti Tawar 450g', price: 18000, unit: '/pack' },
        { id: 'rb_telur', name: 'Telur 10 butir', price: 26000, unit: '/10' },
        { id: 'rb_susu', name: 'Susu UHT 1L', price: 18000, unit: '/1L' },
      ],
    },
    {
      id: 'bundle_2',
      title: `Paket Dapur • ${region}`,
      items: [
        { id: 'rb_minyak', name: 'Minyak Goreng 1L', price: 16500, unit: '/1L' },
        { id: 'rb_gula', name: 'Gula 1kg', price: 15000, unit: '/1kg' },
        { id: 'rb_garam', name: 'Garam 500g', price: 6000, unit: '/500g' },
      ],
    },
    {
      id: 'bundle_3',
      title: `Paket Warung • ${region}`,
      items: [
        { id: 'rb_mie', name: 'Mi Instan 5 pack', price: 14000, unit: '/5' },
        { id: 'rb_kopi', name: 'Kopi Sachet 10', price: 12000, unit: '/10' },
        { id: 'rb_teh', name: 'Teh Celup 25', price: 11000, unit: '/25' },
      ],
    },
  ];
}
