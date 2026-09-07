# ModaStore — Modern E-Commerce Platform

ModaStore adalah platform e-commerce busana modern berbasis **Nuxt 4** dan **SQLite** yang dilengkapi dengan katalog publik responsif, keranjang belanja dengan alur **WhatsApp Direct Checkout**, panel administrasi CMS lengkap dengan sinkronisasi data real-time, manajemen stok multi-varian, serta optimasi SEO menyeluruh.

---

## 🚀 Fitur Utama

### 🛍️ Public Storefront (Pelanggan)
- **Homepage Dinamis**: Hero showcase produk terlaris, navigasi kategori terpopuler, dan produk rekomendasi terbaru.
- **Katalog & Navigasi Fleksibel**:
  - Filter berdasarkan kategori (`/shop/:category`).
  - Pencarian instan kata kunci produk (`/search`).
  - Pengurutan berdasarkan harga termurah, termahal, dan produk terbaru.
- **Halaman Detail Produk (`/product/:slug`)**:
  - Galeri foto produk interaktif.
  - Selektor varian dinamis (warna & ukuran).
  - Indikator stok otomatis sesuai varian yang dipilih.
  - Rekomendasi produk serupa (*similar products*).
- **Keranjang Belanja (`/cart`)**:
  - Tambah, ubah kuantitas, atau hapus item dari cart (tersimpan di *local state*).
  - Validasi stok otomatis saat mengubah kuantitas.
- **WhatsApp Direct Checkout**:
  - Satu klik untuk langsung terhubung ke nomor WhatsApp admin toko.
  - Pesan checkout diformat otomatis dan rapi (detail item, varian warna/ukuran, jumlah, harga per item, dan total belanja).

### ⚙️ Admin CMS Panel (`/admin`)
- **Autentikasi Aman**: Login berbasis JWT cookie HttpOnly (`admin@shop.com` / `admin123` atau username `admin`) dengan proteksi rute middleware.
- **Dashboard Metrik Real-Time (`/admin/dashboard`)**:
  - Total omzet estimasi, jumlah produk aktif, total kategori, dan total inventori stok.
  - Peringatan stok menipis (*low stock warning*, stok $\le$ 5) dan habis secara langsung.
- **Manajemen Produk (`/admin/products`)**:
  - Buat, edit, dan hapus produk.
  - Builder multi-varian fleksibel (Warna, Ukuran, Stok, SKU otomatis/manual).
  - Upload foto produk lokal ke server (`/public/uploads`).
  - Toggle status publikasi instan (*Published* vs *Draft*).
- **Manajemen Kategori (`/admin/categories`)**:
  - Tambah, edit, dan hapus kategori.
  - Generator slug URL otomatis dari nama kategori.
  - Indikator jumlah produk yang terhubung ke setiap kategori.
- **Pengaturan Toko (`/admin/settings`)**:
  - Nama toko, nomor WhatsApp tujuan checkout, deskripsi toko, dan simbol mata uang.
- **Sinkronisasi Real-Time**: Polling otomatis aktif setiap 4 detik pada panel admin untuk memastikan perubahan stok dan katalog selalu mutakhir tanpa perlu refresh manual.

### 🌐 SEO & Performa
- Dynamic Open Graph & Twitter Cards untuk setiap produk dan halaman katalog.
- Peta situs otomatis (`/sitemap.xml`) yang terhubung langsung ke database.
- Direktif search engine (`/robots.txt`).
- Halaman error kustom responsif (`error.vue`).

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 + Composition API + Nitro Engine)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [SQLite](https://sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (WAL mode & foreign key constraints diaktifkan)
- **Icons**: [Lucide Vue Next](https://lucide.dev/)
- **Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing) & [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (admin JWT session)

---

## 📁 Struktur Proyek

```text
├── app/
│   ├── app.vue                      # Root layout entry
│   ├── error.vue                    # Custom 404 & 500 error page
│   ├── components/
│   │   ├── AppHeader.vue            # Storefront navigation bar
│   │   ├── AppFooter.vue            # Storefront footer
│   │   ├── AdminSidebar.vue         # Admin navigation sidebar
│   │   ├── ProductCard.vue          # Storefront product card component
│   │   ├── ProductForm.vue          # Reusable product create/edit form
│   │   └── ToastNotification.vue    # Global toast notification
│   ├── composables/
│   │   ├── useCart.ts               # Reactive shopping cart state
│   │   ├── useAdminAuth.ts          # Admin session state & logout
│   │   ├── useAdminRealtime.ts      # Real-time auto-polling & sync
│   │   ├── useCurrency.ts           # Indonesian Rupiah currency formatter
│   │   ├── useStoreSettings.ts      # Store global settings state
│   │   └── useToast.ts              # Floating toast notification helper
│   ├── layouts/
│   │   ├── default.vue              # Public storefront layout
│   │   └── admin.vue                # Admin dashboard layout
│   ├── middleware/
│   │   └── admin-auth.ts            # Route guard for /admin routes
│   └── pages/
│       ├── index.vue                # Storefront homepage
│       ├── shop/
│       │   ├── index.vue            # All products catalog
│       │   └── [category].vue       # Category filtered catalog
│       ├── product/
│       │   └── [slug].vue           # Product detail page
│       ├── cart.vue                 # Shopping cart & WhatsApp checkout
│       ├── search.vue               # Product search page
│       └── admin/
│           ├── login.vue            # Admin login
│           ├── dashboard.vue        # Admin overview & stats
│           ├── products/
│           │   ├── index.vue        # Product management table
│           │   ├── new.vue          # Create product page
│           │   └── [id]/edit.vue    # Edit product page
│           ├── categories.vue       # Category management
│           └── settings.vue         # Store configuration
├── public/
│   ├── images/products/             # High-res catalog product images
│   ├── uploads/                     # Admin uploaded product images
│   └── robots.txt                   # Search crawler directives
├── server/
│   ├── api/
│   │   ├── products/                # Public product endpoints
│   │   ├── categories.get.ts        # Public categories endpoint
│   │   ├── settings.get.ts          # Public settings endpoint
│   │   └── admin/                   # Secure admin API endpoints
│   ├── routes/
│   │   └── sitemap.xml.ts           # Dynamic XML sitemap
│   └── utils/
│       ├── auth.ts                  # JWT token verify & generation
│       └── db.ts                    # SQLite connection & schema seeding
└── .data/
    └── shop.db                      # SQLite database file
```

---

## 🗄️ Skema Database

```text
Admin
├── id (INTEGER PRIMARY KEY)
├── email (TEXT UNIQUE)
├── passwordHash (TEXT)
├── createdAt (TEXT)
└── updatedAt (TEXT)

Category
├── id (INTEGER PRIMARY KEY)
├── name (TEXT)
└── slug (TEXT UNIQUE)

Product
├── id (INTEGER PRIMARY KEY)
├── name (TEXT)
├── slug (TEXT UNIQUE)
├── description (TEXT)
├── price (INTEGER)
├── categoryId (INTEGER FK -> Category)
├── status (TEXT: 'published' | 'draft')
├── createdAt (TEXT)
└── updatedAt (TEXT)

ProductImage
├── id (INTEGER PRIMARY KEY)
├── productId (INTEGER FK -> Product)
├── imageUrl (TEXT)
└── sortOrder (INTEGER DEFAULT 0)

ProductVariant
├── id (INTEGER PRIMARY KEY)
├── productId (INTEGER FK -> Product)
├── color (TEXT)
├── size (TEXT)
├── stock (INTEGER DEFAULT 0)
└── sku (TEXT)

Setting
├── key (TEXT PRIMARY KEY)
└── value (TEXT)
```

---

## 📡 Daftar Endpoint API

### Public Endpoints
| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/products` | Mendapatkan daftar produk (filter: `category`, `search`, `sort`) |
| `GET` | `/api/products/:slug` | Mendapatkan detail produk, varian, dan galeri gambar |
| `GET` | `/api/products/:slug/similar` | Mendapatkan produk rekomendasi serupa dalam kategori |
| `GET` | `/api/categories` | Mendapatkan daftar kategori beserta jumlah produk aktif |
| `GET` | `/api/settings` | Mendapatkan konfigurasi publik toko (nama toko, WhatsApp, dll.) |
| `GET` | `/sitemap.xml` | Peta situs XML dinamis untuk crawler mesin pencari |

### Admin Endpoints (Protected via Bearer / HttpOnly Cookie)
| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Login admin dengan email/username dan password |
| `POST` | `/api/admin/logout` | Menghapus session admin |
| `GET` | `/api/admin/me` | Memeriksa status session autentikasi admin |
| `GET` | `/api/admin/dashboard` | Mengambil statistik dashboard & daftar produk stok menipis |
| `GET` | `/api/admin/products` | Mengambil semua produk untuk tabel admin |
| `POST` | `/api/admin/products` | Membuat produk baru beserta varian dan gambar |
| `GET` | `/api/admin/products/:id` | Mengambil data produk berdasarkan ID untuk form edit |
| `PUT` | `/api/admin/products/:id` | Memperbarui informasi produk dan varian |
| `DELETE`| `/api/admin/products/:id` | Menghapus produk secara permanen |
| `PATCH`| `/api/admin/products/:id/status`| Mengubah status publikasi produk (*published* / *draft*) |
| `POST` | `/api/admin/upload` | Mengunggah foto produk ke server |
| `GET` | `/api/admin/categories` | Mengambil daftar semua kategori |
| `POST` | `/api/admin/categories` | Menambahkan kategori baru |
| `PUT` | `/api/admin/categories/:id` | Memperbarui nama dan slug kategori |
| `DELETE`| `/api/admin/categories/:id` | Menghapus kategori |
| `GET` | `/api/admin/settings` | Mengambil semua pengaturan toko |
| `PUT` | `/api/admin/settings` | Memperbarui pengaturan toko |

---

## 🔑 Kredensial Default Admin

Untuk mengakses panel admin pada URL `/admin`:

- **Email / Username**: `admin@shop.com` *(atau ketik `admin`)*
- **Password**: `admin123`

> Form login sengaja dikosongkan secara default untuk alasan keamanan dan estetika.

---

## 📦 Panduan Instalasi & Menjalankan

### 1. Prasyarat
- Node.js versi 18 ke atas (disarankan Node.js 20+).
- Paket manajer `npm`, `pnpm`, atau `bun`.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat [http://localhost:3000](http://localhost:3000).

### 4. Build untuk Production
```bash
npm run build
```

Untuk menjalankan preview build production:
```bash
npm run preview
```
Atau langsung menjalankan server nitro hasil kompilasi:
```bash
node .output/server/index.mjs
```

---

## 📜 Lisensi
Dilisensikan di bawah [MIT License](LICENSE).
