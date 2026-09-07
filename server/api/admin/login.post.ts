import { db } from '~~/server/utils/db'
import bcrypt from 'bcryptjs'
import { createAdminToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body || {}

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email dan password wajib diisi'
    })
  }

  const searchEmail = (email || '').trim().toLowerCase()
  const admin = db.prepare(`
    SELECT id, email, passwordHash FROM admin 
    WHERE lower(email) = ? OR (lower(email) = 'admin@shop.com' AND ? = 'admin')
  `).get(searchEmail, searchEmail) as any
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah'
    })
  }

  const isValid = bcrypt.compareSync(password, admin.passwordHash)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah'
    })
  }

  const token = createAdminToken({ id: admin.id, email: admin.email })

  // Set HTTP-only cookie for secure session
  setCookie(event, 'admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  return {
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email
    }
  }
})
