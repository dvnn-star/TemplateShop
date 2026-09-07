import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  const adminId = event.context.admin.id
  const admin = db.prepare('SELECT id, email FROM admin WHERE id = ?').get(adminId) as any

  return {
    settings: {
      store_name: settings.store_name || 'ModaStore Indonesia',
      whatsapp_number: settings.whatsapp_number || '6281234567890',
      store_description: settings.store_description || '',
      currency_symbol: settings.currency_symbol || 'Rp',
    },
    admin: {
      id: admin?.id,
      email: admin?.email
    }
  }
})
