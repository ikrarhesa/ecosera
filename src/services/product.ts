
// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;  // Add unit
  stock: number;  // Add stock
  image: string;  // Add image
  images: string[];
  description: string;  // Add description
  category: string;
  sellerName: string;  // Add sellerName
  sellerPhone: string;
  location: string;
<<<<<<< HEAD
=======
  sellerLat?: number;
  sellerLng?: number;
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
  rating: number;
  tags: string[];
  featured?: boolean;
  available?: boolean;
<<<<<<< HEAD
=======
  seller_id?: string | null;
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
}
