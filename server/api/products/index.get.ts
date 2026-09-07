import { db } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const categorySlug = query.category as string | undefined
  const search = query.q as string | undefined
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined
  const sort = (query.sort as string) || 'newest'
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.max(1, Number(query.limit) || 12)
  const offset = (page - 1) * limit

  const whereConditions: string[] = ["p.status = 'published'"]
  const params: any[] = []

  if (categorySlug) {
    whereConditions.push('c.slug = ?')
    params.push(categorySlug)
  }

  if (search && search.trim()) {
    whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    const pattern = `%${search.trim()}%`
    params.push(pattern, pattern)
  }

  if (minPrice != null && !isNaN(minPrice)) {
    whereConditions.push('p.price >= ?')
    params.push(minPrice)
  }

  if (maxPrice != null && !isNaN(maxPrice)) {
    whereConditions.push('p.price <= ?')
    params.push(maxPrice)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // Sorting
  let orderBy = 'p.createdAt DESC'
  if (sort === 'price-low') {
    orderBy = 'p.price ASC'
  } else if (sort === 'price-high') {
    orderBy = 'p.price DESC'
  } else if (sort === 'name') {
    orderBy = 'p.name ASC'
  } else if (sort === 'oldest') {
    orderBy = 'p.createdAt ASC'
  }

  // Count total products
  const countSql = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    ${whereClause}
  `
  const total = (db.prepare(countSql).get(...params) as { total: number }).total

  // Fetch paginated products
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
    ORDER BY ${orderBy}
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
