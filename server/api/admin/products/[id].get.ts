import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })

  const product = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.categoryId,
      p.status,
      p.createdAt,
      p.updatedAt,
      c.name as categoryName
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.id = ?
  `).get(id) as any

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  const images = db.prepare(`
    SELECT id, imageUrl, sortOrder
    FROM product_images
    WHERE productId = ?
    ORDER BY sortOrder ASC, id ASC
  `).all(id)

  const variants = db.prepare(`
    SELECT id, color, size, stock, sku
    FROM product_variants
    WHERE productId = ?
    ORDER BY id ASC
  `).all(id)

  return {
    ...product,
    images,
    variants
  }
})
