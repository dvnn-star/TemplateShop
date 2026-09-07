import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  // Total products
  const totalProducts = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c
  const publishedProducts = (db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'published'").get() as any).c
  const draftProducts = (db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'draft'").get() as any).c
  const archivedProducts = (db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'archived'").get() as any).c

  // Total categories
  const totalCategories = (db.prepare('SELECT COUNT(*) as c FROM categories').get() as any).c

  // Total variants & stock
  const stockStats = db.prepare(`
    SELECT 
      COALESCE(SUM(stock), 0) as totalStockUnits,
      COUNT(id) as totalVariants
    FROM product_variants
  `).get() as any

  // Low stock variants (stock <= 5)
  const lowStockItems = db.prepare(`
    SELECT 
      pv.id as variantId,
      pv.color,
      pv.size,
      pv.stock,
      pv.sku,
      p.id as productId,
      p.name as productName,
      p.slug as productSlug,
      (
        SELECT imageUrl FROM product_images 
        WHERE productId = p.id 
        ORDER BY sortOrder ASC, id ASC LIMIT 1
      ) as primaryImage
    FROM product_variants pv
    JOIN products p ON pv.productId = p.id
    WHERE pv.stock <= 5
    ORDER BY pv.stock ASC, p.name ASC
    LIMIT 10
  `).all()

  // Recent products
  const recentProducts = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.status,
      p.createdAt,
      c.name as categoryName,
      (
        SELECT imageUrl FROM product_images 
        WHERE productId = p.id 
        ORDER BY sortOrder ASC, id ASC LIMIT 1
      ) as primaryImage,
      COALESCE((SELECT SUM(stock) FROM product_variants WHERE productId = p.id), 0) as totalStock
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    ORDER BY p.createdAt DESC
    LIMIT 5
  `).all()

  return {
    stats: {
      totalProducts,
      publishedProducts,
      draftProducts,
      archivedProducts,
      totalCategories,
      totalStockUnits: stockStats.totalStockUnits,
      totalVariants: stockStats.totalVariants,
      lowStockCount: lowStockItems.length
    },
    lowStockItems,
    recentProducts
  }
})
