export type ProductCategory =
  | 'Film Cameras'
  | 'Digital Cameras'
  | 'Lenses'
  | 'Film'
  | 'Accessories'
  | 'Supplies'

export type Product = {
  id: string
  productCode: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  image: string
  gallery?: string[]
  description: string
  specs?: Array<{ label: string; value: string }>
  featured?: boolean
}

export const seedProducts: Product[] = [
  {
    id: 'cam-001',
    productCode: 'nikon-z6-ii',
    name: 'Nikon Z6 II Mirrorless',
    category: 'Digital Cameras',
    price: 1499,
    stock: 7,
    image:
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Full-frame mirrorless camera with excellent low-light capability.',
    specs: [
      { label: 'Brand', value: 'Nikon' },
      { label: 'Sensor', value: '24.5MP Full Frame CMOS' },
      { label: 'Lens Mount', value: 'Nikon Z' },
      { label: 'Video', value: '4K UHD' }
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
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'Classic 35mm film icon for timeless analog storytelling.',
    specs: [
      { label: 'Brand', value: 'Canon' },
      { label: 'Format', value: '35mm film' },
      { label: 'Mount', value: 'FD mount' }
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
    image:
      'https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=900&q=80',
    description: 'Ultra-sharp pro zoom lens for portraits, travel, and street.'
  },
  {
    id: 'acc-001',
    productCode: 'peak-design-everyday-sling',
    name: 'Peak Design Everyday Sling',
    category: 'Accessories',
    price: 129,
    stock: 11,
    image:
      'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=900&q=80',
    description: 'Compact and playful camera bag built for quick adventures.'
  },
  {
    id: 'film-001',
    productCode: 'kodak-portra-400-5pack',
    name: 'Kodak Portra 400 (5-pack)',
    category: 'Film',
    price: 79,
    stock: 22,
    image:
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=900&q=80',
    description: 'Vibrant color negative film with beautiful skin tones.'
  },
  {
    id: 'sup-001',
    productCode: 'sensor-cleaning-kit-pro',
    name: 'Sensor Cleaning Kit Pro',
    category: 'Supplies',
    price: 35,
    stock: 15,
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
    description: 'Keep your gear spotless and shooting-ready.'
  }
]
