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
