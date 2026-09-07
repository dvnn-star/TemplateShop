import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })

  db.prepare('DELETE FROM products WHERE id = ?').run(id)

  return {
    success: true,
    message: 'Produk berhasil dihapus'
  }
})
