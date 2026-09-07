export interface AdminUser {
  id: number
  email: string
}

export const useAdminAuth = () => {
  const admin = useState<AdminUser | null>('admin_user', () => null)
  const isAuthChecked = useState<boolean>('admin_auth_checked', () => false)
  const config = useRuntimeConfig()
  const adminBase = config.public.adminPath || '/admin-secret'

  const checkAuth = async () => {
    try {
      const res = await $fetch<{ admin: AdminUser }>('/api/admin/me')
      if (res && res.admin) {
        admin.value = res.admin
      } else {
        admin.value = null
      }
    } catch (e) {
      admin.value = null
    } finally {
      isAuthChecked.value = true
    }
    return admin.value
  }

  const login = async (email: string, password: string) => {
    const res = await $fetch<{ success: boolean; admin: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: { email, password }
    })
    if (res && res.admin) {
      admin.value = res.admin
      return res.admin
    }
    throw new Error('Gagal login')
  }

  const logout = async () => {
    try {
      await $fetch('/api/admin/logout', { method: 'POST' })
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      admin.value = null
      navigateTo(`${adminBase}/login`)
    }
  }

  return {
    admin,
    isAuthChecked,
    adminBase,
    checkAuth,
    login,
    logout
  }
}
