import { PrismaClient, Prisma, ProductCategory, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const products: Prisma.ProductCreateInput[] = [
  { productCode: 'nikon-z6-ii', name: 'Nikon Z6 II Mirrorless', category: ProductCategory.DIGITAL_CAMERAS, price: new Prisma.Decimal('1499.00'), stock: 7, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=900&q=80', description: 'Full-frame mirrorless camera with excellent low-light capability.', subcategory: 'Mirrorless', featured: true },
  { productCode: 'canon-ae1-program', name: 'Canon AE-1 Program', category: ProductCategory.FILM_CAMERAS, price: new Prisma.Decimal('390.00'), stock: 4, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80', description: 'Classic 35mm film icon for timeless analog storytelling.', subcategory: 'SLR', featured: true },
  { productCode: 'sony-24-70-f28-gm', name: 'Sony 24-70mm F2.8 GM', category: ProductCategory.LENSES, price: new Prisma.Decimal('1899.00'), stock: 3, image: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=900&q=80', description: 'Ultra-sharp pro zoom lens for portraits, travel, and street.', subcategory: 'Zoom Lenses', featured: false }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({ where: { productCode: product.productCode }, create: product, update: product });
  }

  await prisma.adminUser.upsert({
    where: { email: 'rina@kameradigjitale.local' },
    create: { name: 'Rina Akter', email: 'rina@kameradigjitale.local', role: UserRole.ADMIN, active: true },
    update: { name: 'Rina Akter', role: UserRole.ADMIN, active: true }
  });

  const menu = [
    ['New', '/new', null], ['Film Cameras', '/catalog/film-cameras', ProductCategory.FILM_CAMERAS],
    ['Digital Cameras', '/catalog/digital-cameras', ProductCategory.DIGITAL_CAMERAS], ['Lenses', '/catalog/lenses', ProductCategory.LENSES],
    ['Film', '/catalog/film', ProductCategory.FILM], ['Accessories', '/catalog/accessories', ProductCategory.ACCESSORIES],
    ['Supplies', '/catalog/supplies', ProductCategory.SUPPLIES], ['Brands', '/brands', null], ['Condition', '/condition', null],
    ['VALOI', '/valoi', null], ['Info', '/info', null], ['Sell', '/sell', null]
  ] as const;

  await Promise.all(menu.map(([label, path, category], idx) => prisma.menuItem.upsert({
    where: { path },
    create: { label, path, category: category ?? undefined, position: idx, active: true },
    update: { label, category: category ?? undefined, position: idx, active: true }
  })));
}

main().finally(async () => prisma.$disconnect());
