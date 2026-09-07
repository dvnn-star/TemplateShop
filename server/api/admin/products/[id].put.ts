import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })

  const body = await readBody(event)
  let { name, slug, description, price, categoryId, status, images, variants } = body || {}

  if (!name || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama produk wajib diisi' })
  }

  name = name.trim()
  price = Number(price) || 0
  status = status || 'published'
  categoryId = categoryId ? Number(categoryId) : null

  if (!slug || !slug.trim()) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  } else {
    slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  // Check unique slug excluding current
  const existing = db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(slug, id)
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: `Slug '${slug}' sudah digunakan oleh produk lain` })
  }

  const now = new Date().toISOString()

  // Update product record
  db.prepare(`
    UPDATE products 
    SET name = ?, slug = ?, description = ?, price = ?, categoryId = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `).run(name, slug, description || '', price, categoryId, status, now, id)

  // Replace images
  if (Array.isArray(images)) {
    db.prepare('DELETE FROM product_images WHERE productId = ?').run(id)
    const insertImage = db.prepare('INSERT INTO product_images (productId, imageUrl, sortOrder) VALUES (?, ?, ?)')
    images.forEach((img: any, idx: number) => {
      const url = typeof img === 'string' ? img : img.imageUrl
      if (url && url.trim()) {
        insertImage.run(id, url.trim(), idx)
      }
    })
  }

  // Replace variants
  if (Array.isArray(variants)) {
    db.prepare('DELETE FROM product_variants WHERE productId = ?').run(id)
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (productId, color, size, stock, sku)
      VALUES (?, ?, ?, ?, ?)
    `)
    for (const v of variants) {
      insertVariant.run(
        id,
        v.color ? v.color.trim() : 'Default',
        v.size ? v.size.trim() : 'All Size',
        Number(v.stock) || 0,
        v.sku ? v.sku.trim() : `${slug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 900 + 100)}`
      )
    }
  }

  return {
    success: true,
    productId: id,
    slug
  }
})
