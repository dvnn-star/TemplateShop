export interface AdminLiveStats {
  totalProducts: number
  publishedProducts: number
  draftProducts: number
  archivedProducts: number
  totalCategories: number
  totalStockUnits: number
  totalVariants: number
  lowStockCount: number
}

export const useAdminRealtime = () => {
  const stats = useState<AdminLiveStats>('admin_live_stats', () => ({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    archivedProducts: 0,
    totalCategories: 0,
    totalStockUnits: 0,
    totalVariants: 0,
    lowStockCount: 0,
  }))

  const lastUpdated = useState<string>('admin_last_updated', () => '')
  const isSyncing = useState<boolean>('admin_is_syncing', () => false)

  const refreshStats = async () => {
    if (isSyncing.value) return
    try {
      isSyncing.value = true
      const data = await $fetch<any>('/api/admin/dashboard', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      if (data && data.stats) {
        stats.value = { ...data.stats }
        const now = new Date()
        lastUpdated.value = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
      return data
    } catch (err) {
      // Ignore background poll errors (e.g. on logout)
    } finally {
      isSyncing.value = false
    }
  }

  return {
    stats,
    lastUpdated,
    isSyncing,
    refreshStats
  }
}
