export type ProductVariant = {
  id: string;
  variant_name: string;
  price_override: number | null;
  stock: number | null;
};

export type Product = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  rating: number;
  sold: number;
  thumb?: string;
  category?: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  available?: boolean;
  stock?: number;
  unit?: string;
  image?: string;
  images?: string[];
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  location?: string;
  sellerLat?: number;
  sellerLng?: number;
  seller_id?: string | null;
  variants?: ProductVariant[];
};
