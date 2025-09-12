export type Product = {
  id: string;
  name: string;
  price: number;         // in IDR
  rating: number;        // 0..5
  sold: number;          // count
  thumb?: string;        // URL or /images/...
  category?: string;     // e.g. "kopi"
  tags?: string[];       // optional search helpers
  featured?: boolean;    // show on Home
  available?: boolean;   // hide if false
};
