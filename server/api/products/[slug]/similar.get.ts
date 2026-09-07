import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return []

  const current = db.prepare('SELECT id, categoryId FROM products WHERE slug = ?').get(slug) as any
  if (!current) return []

  const sql = `
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      c.name as categoryName,
      c.slug as categorySlug,
      (
        SELECT imageUrl FROM product_images 
        WHERE productId = p.id 
        ORDER BY sortOrder ASC, id ASC LIMIT 1
      ) as primaryImage,
      COALESCE((SELECT SUM(stock) FROM product_variants WHERE productId = p.id), 0) as totalStock,
      (SELECT COUNT(id) FROM product_variants WHERE productId = p.id) as variantCount
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE p.status = 'published' AND p.id != ? AND p.categoryId = ?
    ORDER BY p.createdAt DESC
    LIMIT 4
  `

  const similar = db.prepare(sql).all(current.id, current.categoryId)
  return similar
})
