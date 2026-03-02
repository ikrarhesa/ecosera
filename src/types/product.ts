export type Product = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  rating: number;
  sold: number;
  thumb?: string;
  category?: string;
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
<<<<<<< HEAD
=======
  sellerLat?: number;
  sellerLng?: number;
  seller_id?: string | null;
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
};
