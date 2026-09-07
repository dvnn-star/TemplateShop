import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
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

  // Ensure slug uniqueness
  let finalSlug = slug
  let counter = 1
  while (true) {
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(finalSlug)
    if (!existing) break
    finalSlug = `${slug}-${counter}`
    counter++
  }

  const now = new Date().toISOString()

  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, description, price, categoryId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const res = insertProduct.run(name, finalSlug, description || '', price, categoryId, status, now, now)
  const productId = Number(res.lastInsertRowid)

  // Insert images
  if (Array.isArray(images) && images.length > 0) {
    const insertImage = db.prepare('INSERT INTO product_images (productId, imageUrl, sortOrder) VALUES (?, ?, ?)')
    images.forEach((img: any, idx: number) => {
      const url = typeof img === 'string' ? img : img.imageUrl
      if (url && url.trim()) {
        insertImage.run(productId, url.trim(), idx)
      }
    })
  }

  // Insert variants
  if (Array.isArray(variants) && variants.length > 0) {
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (productId, color, size, stock, sku)
      VALUES (?, ?, ?, ?, ?)
    `)
    for (const v of variants) {
      insertVariant.run(
        productId,
        v.color ? v.color.trim() : 'Default',
        v.size ? v.size.trim() : 'All Size',
        Number(v.stock) || 0,
        v.sku ? v.sku.trim() : `${finalSlug.toUpperCase().slice(0, 4)}-${Math.floor(Math.random() * 900 + 100)}`
      )
    }
  } else {
    // If no variant provided, create a default variant
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (productId, color, size, stock, sku)
      VALUES (?, ?, ?, ?, ?)
    `)
    insertVariant.run(productId, 'Default', 'All Size', 10, `${finalSlug.toUpperCase().slice(0, 4)}-01`)
  }

  return {
    success: true,
    productId,
    slug: finalSlug
  }
})
