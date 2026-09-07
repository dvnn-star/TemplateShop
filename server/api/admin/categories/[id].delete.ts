import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid' })

  // When deleted, products with this categoryId will have categoryId set to NULL via foreign key constraint
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)

  return {
    success: true,
    message: 'Kategori berhasil dihapus'
  }
})
