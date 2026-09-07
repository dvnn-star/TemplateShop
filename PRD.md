## 17. Database

### 18. Suggested Database Structure

#### Admin

```text
Admin
- id
- email
- passwordHash
- createdAt
- updatedAt
```

#### Product

```text
Product
- id
- name
- slug
- description
- price
- categoryId
- status
- createdAt
- updatedAt
```

#### Product Image

```text
ProductImage
- id
- productId
- imageUrl
- sortOrder
```

#### Product Variant

```text
ProductVariant
- id
- productId
- color
- size
- stock
- sku
```

#### Category

```text
Category
- id
- name
- slug
```

---

## 19. Functional Requirements

| ID    | Requirement                                        | Priority |
| ----- | -------------------------------------------------- | -------- |
| FR-01 | User dapat melihat homepage                        | Must     |
| FR-02 | User dapat melihat katalog produk                  | Must     |
| FR-03 | User dapat mencari produk                          | Must     |
| FR-04 | User dapat filter produk                           | Should   |
| FR-05 | User dapat melihat detail produk                   | Must     |
| FR-06 | User dapat memilih size/variant                    | Must     |
| FR-07 | User dapat menambahkan produk ke cart              | Must     |
| FR-08 | User dapat mengubah quantity                       | Must     |
| FR-09 | User dapat menghapus produk dari cart              | Must     |
| FR-10 | User dapat checkout melalui WhatsApp               | Must     |
| FR-11 | User dapat melihat produk serupa                   | Should   |
| FR-12 | Admin dapat login                                  | Must     |
| FR-13 | Admin dapat CRUD produk                            | Must     |
| FR-14 | Admin dapat CRUD kategori                          | Must     |
| FR-15 | Admin dapat mengatur stok                          | Must     |
| FR-16 | Admin dapat upload foto produk                     | Must     |
| FR-17 | Admin dapat publish/unpublish produk               | Should   |
| FR-18 | Admin dapat mengakses dashboard melalui URL khusus | Must     |

---

## 20. Non-Functional Requirements

### Performance

* Halaman utama cepat dimuat.
* Image menggunakan optimization.
* Lazy loading untuk gambar produk.
* Responsive pada berbagai ukuran layar.

### Security

* Admin route harus protected.
* Password tidak boleh disimpan dalam plaintext.
* Session/token harus aman.
* Customer tidak memiliki akses ke CMS.
* API admin harus melakukan authorization, bukan hanya menyembunyikan menu.

### SEO

Public storefront harus mendukung:

* SEO title
* Meta description
* Open Graph
* Product URL yang SEO-friendly
* Sitemap
* Structured data produk jika memungkinkan

---

## 21. MVP Scope

### Must Have

**Customer**

* Homepage
* Product catalog
* Product detail
* Search
* Product variant
* Cart
* WhatsApp checkout
* Similar products
* Responsive design

**Admin**

* Secret admin URL
* Login
* Dashboard
* Product CRUD
* Category CRUD
* Stock management
* Image upload
* Publish/unpublish

### Future / Phase 2

* Customer account
* Wishlist
* Online payment
* Order tracking
* Discount/coupon
* Reviews
* Product recommendation yang lebih pintar
* Analytics dashboard
* Multiple admin roles
* Automated WhatsApp order management

---

## 22. Success Metrics

Produk dapat dianggap berhasil apabila:

* Customer dapat menemukan produk dengan cepat.
* Customer berhasil menambahkan produk ke cart.
* Customer dapat checkout ke WhatsApp tanpa error.
* Admin dapat menambahkan produk baru tanpa bantuan developer.
* Admin dapat mengubah harga/stok secara mandiri.
* Website memiliki conversion yang baik dari **product view → WhatsApp checkout**.

### KPI Utama

```text
Product View
     ↓
Add to Cart Rate
     ↓
WhatsApp Checkout Click
     ↓
WhatsApp Order
```

---

## 23. Acceptance Criteria — WhatsApp Checkout

**Given:** customer memiliki produk di cart.

**When:** customer menekan "Checkout via WhatsApp".

**Then:**

1. Sistem mengambil seluruh item cart.
2. Sistem mengambil variant dan quantity.
3. Sistem menghitung total harga.
4. Sistem membuat pesan WhatsApp.
5. Sistem membuka WhatsApp.
6. Pesan sudah terisi otomatis.
7. Customer dapat mengirim pesan kepada admin.

---

## 24. Acceptance Criteria — Admin Product

**Given:** admin sudah login.

**When:** admin membuat produk baru.

**Then:**

1. Admin mengisi nama produk.
2. Admin memasukkan harga.
3. Admin memilih kategori.
4. Admin mengupload foto.
5. Admin menentukan size/variant.
6. Admin menentukan stock.
7. Admin memilih status.
8. Admin menyimpan produk.
9. Produk muncul di storefront jika statusnya Published.

---

## 25. Proposed Site Structure

```text
PUBLIC

/
├── Home
├── /shop
├── /shop/[category]
├── /product/[slug]
├── /cart
└── /search


ADMIN

/[secret-admin-url]
├── /login
├── /dashboard
├── /products
├── /products/new
├── /products/[id]/edit
├── /categories
└── /settings
```

**Catatan keamanan:** Secret URL sebaiknya dianggap sebagai *additional obscurity*, bukan security utama. Authentication dan authorization tetap wajib.
