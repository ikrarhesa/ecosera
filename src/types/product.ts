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
  rating: number;
  tags: string[];
  featured?: boolean;
  available?: boolean;
}
