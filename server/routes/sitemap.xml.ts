import { db } from '~~/server/utils/db'

export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const baseUrl = `${proto}://${host}`

  const products = db.prepare("SELECT slug, updatedAt FROM products WHERE status = 'published'").all() as any[]
  const categories = db.prepare('SELECT slug FROM categories').all() as any[]

  const urls: string[] = [
    `  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    `  <url>
    <loc>${baseUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
    `  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
  ]

  // Add categories
  for (const cat of categories) {
    urls.push(`  <url>
    <loc>${baseUrl}/shop/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  // Add products
  for (const prod of products) {
    const lastMod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    urls.push(`  <url>
    <loc>${baseUrl}/product/${prod.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml')
  return sitemap
})
