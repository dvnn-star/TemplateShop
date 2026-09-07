import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const status = query.status as string | undefined
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const search = query.q as string | undefined
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.max(1, Number(query.limit) || 20)
  const offset = (page - 1) * limit

  const whereConditions: string[] = []
  const params: any[] = []

  if (status && status !== 'all') {
    whereConditions.push('p.status = ?')
    params.push(status)
  }

  if (categoryId) {
    whereConditions.push('p.categoryId = ?')
    params.push(categoryId)
  }

  if (search && search.trim()) {
    whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    const pattern = `%${search.trim()}%`
    params.push(pattern, pattern)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const countSql = `
    SELECT COUNT(p.id) as total
    FROM products p
    ${whereClause}
  `
  const total = (db.prepare(countSql).get(...params) as { total: number }).total

  const sql = `
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
    ${whereClause}
    ORDER BY p.createdAt DESC
    LIMIT ? OFFSET ?
  `

  const products = db.prepare(sql).all(...params, limit, offset)

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})
