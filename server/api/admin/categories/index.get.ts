import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const sql = `
    SELECT 
      c.id,
      c.name,
      c.slug,
      COUNT(p.id) as productCount
    FROM categories c
    LEFT JOIN products p ON p.categoryId = c.id
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
  `
  const categories = db.prepare(sql).all()
  return categories
})
