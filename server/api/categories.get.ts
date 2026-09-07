import { db } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const query = `
    SELECT 
      c.id, 
      c.name, 
      c.slug,
      COUNT(p.id) as productCount
    FROM categories c
    LEFT JOIN products p ON p.categoryId = c.id AND p.status = 'published'
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
  `
  const categories = db.prepare(query).all()
  return categories
})
