import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid' })

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

  // Check unique slug excluding current
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, id)
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: `Slug '${slug}' sudah digunakan oleh kategori lain` })
  }

  db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id)

  return {
    success: true,
    category: { id, name, slug }
  }
})
