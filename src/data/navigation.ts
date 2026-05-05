import type { ProductCategory } from './products'

export type NavSubcategory = {
  id: string
  slug?: string
  title: string
  image: string
}

export type MenuItem = {
  label: string
  path: string
  category?: ProductCategory
}

export type CategoryNavigationMap = Partial<Record<ProductCategory, NavSubcategory[]>>

export const menuItems: MenuItem[] = [
  { label: 'New', path: '/new' },
  { label: 'Film Cameras', path: '/catalog/film-cameras', category: 'Film Cameras' },
  { label: 'Digital Cameras', path: '/catalog/digital-cameras', category: 'Digital Cameras' },
  { label: 'Lenses', path: '/catalog/lenses', category: 'Lenses' },
  { label: 'Film', path: '/catalog/film', category: 'Film' },
  { label: 'Accessories', path: '/catalog/accessories', category: 'Accessories' },
  { label: 'Supplies', path: '/catalog/supplies', category: 'Supplies' },
  { label: 'Brands', path: '/brands' },
  { label: 'Condition', path: '/condition' },
  { label: 'VALOI', path: '/valoi' },
  { label: 'Info', path: '/info' },
  { label: 'Sell', path: '/sell' }
]

export const seedCategoryNavigation: CategoryNavigationMap = {
  'Digital Cameras': [
    {
      id: 'digital-mirrorless',
      title: 'Mirrorless',
      image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'digital-slr',
      title: 'SLR',
      image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'digital-point-shoot',
      title: 'Point & Shoot',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'
    }
  ],
  Lenses: [
    {
      id: 'lenses-prime',
      title: 'Prime Lenses',
      image: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'lenses-zoom',
      title: 'Zoom Lenses',
      image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80'
    }
  ],
  Accessories: [
    {
      id: 'acc-bags-cases',
      title: 'Bags & Cases',
      image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'acc-straps',
      title: 'Straps',
      image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=80'
    }
  ]
}
