export type MenuItem = {
  label: string
  path: string
  category?: string
}

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
