export default defineEventHandler((event) => {
  // admin is populated by server/middleware/adminAuth.ts
  const admin = event.context.admin
  return {
    admin
  }
})
