import { Product } from './products.types';

export const seedProducts: Product[] = [
  {
    id: 'cam-001',
    productCode: 'nikon-z6-ii',
    name: 'Nikon Z6 II Mirrorless',
    category: 'Digital Cameras',
    price: 1499,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80',
    description: 'Full-frame mirrorless camera with excellent low-light capability.',
    subcategory: 'Mirrorless',
    specs: [
      { label: 'Brand', value: 'Nikon' },
      { label: 'Sensor', value: 'Full frame' }
    ],
    featured: true
  },
  {
    id: 'cam-002',
    productCode: 'canon-ae1-program',
    name: 'Canon AE-1 Program',
    category: 'Film Cameras',
    price: 390,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    description: 'Classic 35mm film icon for timeless analog storytelling.',
    subcategory: 'SLR',
    specs: [
      { label: 'Brand', value: 'Canon' },
      { label: 'Format', value: '35mm film' }
    ],
    featured: true
  },
  {
    id: 'len-001',
    productCode: 'sony-24-70-f28-gm',
    name: 'Sony 24-70mm F2.8 GM',
    category: 'Lenses',
    price: 1899,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=900&q=80',
    description: 'Ultra-sharp pro zoom lens for portraits, travel, and street.',
    subcategory: 'Zoom Lenses',
    specs: [
      { label: 'Brand', value: 'Sony' },
      { label: 'Mount', value: 'Sony E' }
    ]
  }
];
