import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })

  const body = await readBody(event)
  const { status } = body || {}

  if (!['published', 'draft', 'archived'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status tidak valid' })
  }

  const now = new Date().toISOString()
  db.prepare('UPDATE products SET status = ?, updatedAt = ? WHERE id = ?').run(status, now, id)

  return {
    success: true,
    status
  }
})
