import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const dataDir = path.resolve(process.cwd(), '.data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'shop.db')
export const db = new Database(dbPath)

// Enable foreign keys and WAL mode for better concurrency
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize tables as specified in PRD Section 18
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      categoryId INTEGER,
      status TEXT NOT NULL DEFAULT 'published',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      imageUrl TEXT NOT NULL,
      sortOrder INTEGER DEFAULT 0,
      FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      color TEXT,
      size TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Run initial seed if no admin exists
  const adminCount = (db.prepare('SELECT COUNT(*) as count FROM admin').get() as { count: number }).count
  if (adminCount === 0) {
    seedData()
  }
}

function seedData() {
  const now = new Date().toISOString()
  
  // Seed admin
  const passwordHash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO admin (email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
    'admin@shop.com',
    passwordHash,
    now,
    now
  )

  // Seed default settings
  const settings = [
    { key: 'store_name', value: 'ModaStore Indonesia' },
    { key: 'whatsapp_number', value: '6281234567890' },
    { key: 'store_description', value: 'Pusat belanja busana pria & wanita terpercaya dengan kualitas terbaik dan pengiriman ke seluruh Indonesia.' },
    { key: 'currency_symbol', value: 'Rp' },
  ]
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  for (const s of settings) {
    insertSetting.run(s.key, s.value)
  }

  // Seed categories
  const categories = [
    { name: 'Kaos & T-Shirt', slug: 'kaos-t-shirt' },
    { name: 'Kemeja', slug: 'kemeja' },
    { name: 'Celana & Chino', slug: 'celana-chino' },
    { name: 'Jaket & Hoodie', slug: 'jaket-hoodie' },
    { name: 'Aksesoris & Topi', slug: 'aksesoris-topi' },
  ]

  const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
  const catMap = new Map<string, number>()
  for (const cat of categories) {
    const res = insertCategory.run(cat.name, cat.slug)
    catMap.set(cat.slug, Number(res.lastInsertRowid))
  }

  // Seed sample products
  const products = [
    {
      name: 'Kaos Oversize Heavy Cotton',
      slug: 'kaos-oversize-heavy-cotton',
      description: 'Kaos oversized premium berbahan 100% combed cotton 24s yang tebal, adem, dan nyaman dipakai seharian. Potongan modern streetwear cocok untuk daily outfit santai maupun hangout.',
      price: 129000,
      categorySlug: 'kaos-t-shirt',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Hitam', size: 'M', stock: 25, sku: 'TS-OVR-BLK-M' },
        { color: 'Hitam', size: 'L', stock: 18, sku: 'TS-OVR-BLK-L' },
        { color: 'Putih', size: 'M', stock: 15, sku: 'TS-OVR-WHT-M' },
        { color: 'Putih', size: 'L', stock: 20, sku: 'TS-OVR-WHT-L' },
        { color: 'Sage Green', size: 'L', stock: 10, sku: 'TS-OVR-SGE-L' },
      ]
    },
    {
      name: 'Kemeja Flannel Tartan Casual',
      slug: 'kemeja-flannel-tartan-casual',
      description: 'Kemeja flannel motif kotak tartan klasik dengan bahan katun wool blend bertekstur lembut. Jahitan rapi, kancing eksklusif, cocok untuk gaya smart-casual.',
      price: 199000,
      categorySlug: 'kemeja',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Merah Navy', size: 'M', stock: 12, sku: 'FLN-RED-M' },
        { color: 'Merah Navy', size: 'L', stock: 14, sku: 'FLN-RED-L' },
        { color: 'Merah Navy', size: 'XL', stock: 8, sku: 'FLN-RED-XL' },
        { color: 'Hijau Hitam', size: 'L', stock: 9, sku: 'FLN-GRN-L' },
      ]
    },
    {
      name: 'Celana Chino Slim Fit Stretch',
      slug: 'celana-chino-slim-fit-stretch',
      description: 'Celana chino stretch model slim fit dengan elastisitas tinggi untuk mobilitas maksimal. Pilihan tepat untuk aktivitas kantor maupun santai di akhir pekan.',
      price: 215000,
      categorySlug: 'celana-chino',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Khaki', size: '30', stock: 15, sku: 'CHN-KHK-30' },
        { color: 'Khaki', size: '32', stock: 16, sku: 'CHN-KHK-32' },
        { color: 'Abu-Abu', size: '30', stock: 10, sku: 'CHN-GRY-30' },
        { color: 'Abu-Abu', size: '32', stock: 12, sku: 'CHN-GRY-32' },
        { color: 'Hitam', size: '32', stock: 22, sku: 'CHN-BLK-32' },
      ]
    },
    {
      name: 'Jaket Hoodie Fleece Pullover',
      slug: 'jaket-hoodie-fleece-pullover',
      description: 'Hoodie pullover dengan material cotton fleece gramasi 330 gsm yang hangat dan lembut di kulit. Dilengkapi saku kangguru dan tali serut tahan lama.',
      price: 249000,
      categorySlug: 'jaket-hoodie',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Charcoal', size: 'M', stock: 14, sku: 'HD-CHR-M' },
        { color: 'Charcoal', size: 'L', stock: 16, sku: 'HD-CHR-L' },
        { color: 'Navy', size: 'L', stock: 11, sku: 'HD-NVY-L' },
        { color: 'Navy', size: 'XL', stock: 7, sku: 'HD-NVY-XL' },
      ]
    },
    {
      name: 'Topi Baseball Vintage Corduroy',
      slug: 'topi-baseball-vintage-corduroy',
      description: 'Topi baseball 6-panel berbahan corduroy lembut dengan adjustable brass buckle di bagian belakang. Aksen bordir vintage minimalis.',
      price: 89000,
      categorySlug: 'aksesoris-topi',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Cokelat Terracotta', size: 'All Size', stock: 30, sku: 'CAP-TER-AS' },
        { color: 'Hitam', size: 'All Size', stock: 25, sku: 'CAP-BLK-AS' },
        { color: 'Olive', size: 'All Size', stock: 18, sku: 'CAP-OLV-AS' },
      ]
    },
    {
      name: 'Kemeja Oxford Button Down',
      slug: 'kemeja-oxford-button-down',
      description: 'Kemeja oxford lengan panjang berpotongan regular fit. Kerah button-down dengan kain breathable berdaya tahan tinggi, cocok untuk outfit formal maupun semi-formal.',
      price: 185000,
      categorySlug: 'kemeja',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80'
      ],
      variants: [
        { color: 'Biru Muda', size: 'M', stock: 10, sku: 'OXF-BLU-M' },
        { color: 'Biru Muda', size: 'L', stock: 14, sku: 'OXF-BLU-L' },
        { color: 'Putih', size: 'M', stock: 12, sku: 'OXF-WHT-M' },
        { color: 'Putih', size: 'L', stock: 15, sku: 'OXF-WHT-L' },
      ]
    }
  ]

  const insertProduct = db.prepare(`
    INSERT INTO products (name, slug, description, price, categoryId, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const insertImage = db.prepare(`
    INSERT INTO product_images (productId, imageUrl, sortOrder)
    VALUES (?, ?, ?)
  `)
  const insertVariant = db.prepare(`
    INSERT INTO product_variants (productId, color, size, stock, sku)
    VALUES (?, ?, ?, ?, ?)
  `)

  for (const p of products) {
    const catId = catMap.get(p.categorySlug) || null
    const res = insertProduct.run(p.name, p.slug, p.description, p.price, catId, p.status, now, now)
    const productId = Number(res.lastInsertRowid)

    p.images.forEach((img, idx) => {
      insertImage.run(productId, img, idx)
    })

    for (const v of p.variants) {
      insertVariant.run(productId, v.color, v.size, v.stock, v.sku)
    }
  }
}

// Automatically initialize schema when module is imported
initDatabase()
