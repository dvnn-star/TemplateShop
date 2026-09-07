import { db } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug parameter is required' })
  }

  const productSql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.categoryId,
      p.status,
      p.createdAt,
      c.name as categoryName,
      c.slug as categorySlug
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.slug = ? AND p.status = 'published'
  `
  const product = db.prepare(productSql).get(slug) as any

  if (!product) {
    throw createError({ statusCode: 404, message: 'Produk tidak ditemukan' })
  }

  // Get images
  const images = db.prepare(`
    SELECT id, imageUrl, sortOrder
    FROM product_images
    WHERE productId = ?
    ORDER BY sortOrder ASC, id ASC
  `).all(product.id)

  // Get variants
  const variants = db.prepare(`
    SELECT id, color, size, stock, sku
    FROM product_variants
    WHERE productId = ?
    ORDER BY color ASC, size ASC
  `).all(product.id)

  // Calculate total stock
  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)

  return {
    ...product,
    images,
    variants,
    totalStock
  }
})
