import { db } from '~/server/utils/db'

export default defineEventHandler((event) => {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }
  return {
    store_name: settings.store_name || 'ModaStore',
    whatsapp_number: settings.whatsapp_number || '6281234567890',
    store_description: settings.store_description || 'Toko online terpercaya',
    currency_symbol: settings.currency_symbol || 'Rp',
  }
})
