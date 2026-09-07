import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { name, slug } = body || {}

  if (!name || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi' })
  }

  name = name.trim()
  if (!slug || !slug.trim()) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  } else {
    slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  // Check unique slug
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: `Slug '${slug}' sudah digunakan oleh kategori lain` })
  }

  const res = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name, slug)

  return {
    success: true,
    category: {
      id: Number(res.lastInsertRowid),
      name,
      slug,
      productCount: 0
    }
  }
})
