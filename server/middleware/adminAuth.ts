import { getAdminFromEvent } from '../utils/auth'

export default defineEventHandler((event) => {
  const path = getRequestPath(event)

  // Guard all /api/admin routes except the login route
  if (path.startsWith('/api/admin') && !path.startsWith('/api/admin/login')) {
    const admin = getAdminFromEvent(event)
    event.context.admin = admin
  }
})
