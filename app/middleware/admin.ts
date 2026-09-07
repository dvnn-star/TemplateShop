export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()
  const adminBase = config.public.adminPath || '/admin-secret'
  const { admin, checkAuth } = useAdminAuth()

  // Always verify current session from backend
  await checkAuth()

  const isLoginPage = to.path === `${adminBase}/login`

  if (!admin.value && !isLoginPage) {
    // Redirect unauthenticated user to admin login
    return navigateTo(`${adminBase}/login`)
  }

  if (admin.value && isLoginPage) {
    // Redirect authenticated user to dashboard
    return navigateTo(`${adminBase}/dashboard`)
  }
})
