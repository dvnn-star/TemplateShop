import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { db } from './db'

export interface AdminPayload {
  id: number
  email: string
}

export function getJwtSecret(): string {
  const config = useRuntimeConfig()
  return config.jwtSecret || 'super-secret-store-jwt-key-2026'
}

export function createAdminToken(admin: AdminPayload): string {
  return jwt.sign(admin, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AdminPayload
  } catch (e) {
    return null
  }
}

export function getAdminFromEvent(event: H3Event): AdminPayload {
  // Check cookie first
  let token = getCookie(event, 'admin_token')

  // Or check Authorization header
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login.'
    })
  }

  const payload = verifyAdminToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akses ditolak: Token tidak valid atau sesi telah berakhir.'
    })
  }

  // Verify admin still exists in database
  const admin = db.prepare('SELECT id, email FROM admin WHERE id = ?').get(payload.id)
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akses ditolak: Akun admin tidak ditemukan.'
    })
  }

  return payload
}
