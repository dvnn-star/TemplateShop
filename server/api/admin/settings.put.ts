import { db } from '~/server/utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { store_name, whatsapp_number, store_description, currentPassword, newPassword } = body || {}

  // Update settings in database
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  if (store_name !== undefined) upsert.run('store_name', store_name)
  if (whatsapp_number !== undefined) upsert.run('whatsapp_number', whatsapp_number)
  if (store_description !== undefined) upsert.run('store_description', store_description)

  // Handle password change if requested
  if (newPassword) {
    if (!currentPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password saat ini wajib diisi untuk mengubah password'
      })
    }

    const adminId = event.context.admin.id
    const admin = db.prepare('SELECT id, passwordHash FROM admin WHERE id = ?').get(adminId) as any

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash)
    if (!isMatch) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password saat ini tidak sesuai'
      })
    }

    const newHash = bcrypt.hashSync(newPassword, 10)
    const now = new Date().toISOString()
    db.prepare('UPDATE admin SET passwordHash = ?, updatedAt = ? WHERE id = ?').run(newHash, now, adminId)
  }

  return {
    success: true,
    message: 'Pengaturan berhasil disimpan'
  }
})
