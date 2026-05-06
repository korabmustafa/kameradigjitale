export type ProductCategory = 'Film Cameras' | 'Digital Cameras' | 'Lenses' | 'Film' | 'Accessories' | 'Supplies';

export type Product = {
  id: string;
  productCode: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image: string;
  gallery?: string[];
  description: string;
  subcategory?: string;
  specs?: Array<{ label: string; value: string }>;
  featured?: boolean;
};
