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
};
