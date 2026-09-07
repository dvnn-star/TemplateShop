<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  ChevronRight,
  Sparkles
} from 'lucide-vue-next'
import { formatRupiah } from '~/composables/useCurrency'
import { useCart } from '~/composables/useCart'
import { useToast } from '~/composables/useToast'
import { useStoreSettings } from '~/composables/useStoreSettings'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { addItem } = useCart()
const { showToast } = useToast()
const { data: settings } = useStoreSettings()

// Fetch product details
const { data: product, error } = await useFetch(`/api/products/${slug.value}`)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan', fatal: true })
}

// Fetch similar products
const { data: similarProducts } = await useFetch(`/api/products/${slug.value}/similar`)

// Gallery active image
const activeImageIndex = ref(0)
const activeImage = computed(() => {
  if (product.value?.images && product.value.images.length > 0) {
    return product.value.images[activeImageIndex.value]?.imageUrl || product.value.images[0].imageUrl
  }
  return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
})

// Variant selection logic
// Group variants by color
const availableColors = computed(() => {
  const colors = new Set<string>()
  product.value?.variants?.forEach((v: any) => {
    if (v.color) colors.add(v.color)
  })
  return Array.from(colors)
})

const selectedColor = ref<string>(availableColors.value[0] || '')

// Available sizes for currently selected color
const availableSizes = computed(() => {
  if (!product.value?.variants) return []
  return product.value.variants
    .filter((v: any) => !selectedColor.value || v.color === selectedColor.value)
    .map((v: any) => ({ size: v.size, stock: v.stock, id: v.id }))
})

const selectedSize = ref<string>('')

// Initialize selected size
watch(
  availableSizes,
  (sizes) => {
    if (sizes.length > 0 && (!selectedSize.value || !sizes.some(s => s.size === selectedSize.value))) {
      const inStockSize = sizes.find(s => s.stock > 0)
      selectedSize.value = inStockSize ? inStockSize.size : sizes[0].size
    }
  },
  { immediate: true }
)

// Active selected variant object
const selectedVariant = computed(() => {
  if (!product.value?.variants) return null
  return product.value.variants.find((v: any) => {
    const colorMatch = !selectedColor.value || v.color === selectedColor.value
    const sizeMatch = !selectedSize.value || v.size === selectedSize.value
    return colorMatch && sizeMatch
  }) || product.value.variants[0]
})

// Quantity state
const quantity = ref(1)

const maxAvailableStock = computed(() => {
  return selectedVariant.value ? selectedVariant.value.stock : 0
})

const incrementQty = () => {
  if (quantity.value < maxAvailableStock.value) {
    quantity.value++
  }
}

const decrementQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Add to Cart handler
const handleAddToCart = () => {
  if (!selectedVariant.value || maxAvailableStock.value <= 0) {
    showToast('Stok varian ini sedang habis.', 'error')
    return
  }

  const result = addItem({
    productId: product.value.id,
    variantId: selectedVariant.value.id,
    productName: product.value.name,
    productSlug: product.value.slug,
    imageUrl: activeImage.value,
    color: selectedVariant.value.color || '-',
    size: selectedVariant.value.size || '-',
    price: product.value.price,
    quantity: quantity.value,
    maxStock: maxAvailableStock.value
  })

  if (result.success) {
    showToast(`${product.value.name} (${selectedVariant.value.color} / ${selectedVariant.value.size}) ditambahkan ke keranjang!`, 'success')
  } else {
    showToast(result.message, 'error')
  }
}

// Direct WhatsApp Checkout for single product
const handleDirectWhatsApp = () => {
  if (!selectedVariant.value || maxAvailableStock.value <= 0) {
    showToast('Stok varian ini sedang habis.', 'error')
    return
  }

  const phone = settings.value?.whatsapp_number || '6281234567890'
  const totalPrice = product.value.price * quantity.value
  const msg = [
    `Halo Admin ${settings.value?.store_name || 'ModaStore'}, saya ingin order langsung produk ini:`,
    '',
    `*Produk:* ${product.value.name}`,
    `*Varian:* Warna ${selectedVariant.value.color || '-'} | Size ${selectedVariant.value.size || '-'}`,
    `*Jumlah:* ${quantity.value} pcs`,
    `*Harga Satuan:* ${formatRupiah(product.value.price)}`,
    `*Total Harga:* ${formatRupiah(totalPrice)}`,
    '',
    `Mohon info ketersediaan dan ongkir ke alamat saya ya. Terima kasih!`
  ].join('\n')

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}

// SEO & Structured Data (JSON-LD)
useHead({
  title: computed(() => `${product.value?.name} - ${settings.value?.store_name || 'ModaStore'}`),
  meta: [
    {
      name: 'description',
      content: computed(() => product.value?.description?.slice(0, 160) || '')
    },
    {
      property: 'og:title',
      content: computed(() => product.value?.name || '')
    },
    {
      property: 'og:description',
      content: computed(() => product.value?.description?.slice(0, 160) || '')
    },
    {
      property: 'og:image',
      content: computed(() => activeImage.value)
    },
    {
      property: 'og:type',
      content: 'product'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.value?.name,
          image: product.value?.images?.map((img: any) => img.imageUrl) || [],
          description: product.value?.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'IDR',
            price: product.value?.price,
            availability:
              product.value?.totalStock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock'
          }
        })
      )
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 mb-8 overflow-x-auto whitespace-nowrap">
      <NuxtLink to="/" class="hover:text-neutral-900">Beranda</NuxtLink>
      <ChevronRight class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <NuxtLink to="/shop" class="hover:text-neutral-900">Katalog</NuxtLink>
      <template v-if="product.categoryName">
        <ChevronRight class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <NuxtLink :to="`/shop/${product.categorySlug}`" class="hover:text-neutral-900">
          {{ product.categoryName }}
        </NuxtLink>
      </template>
      <ChevronRight class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <span class="text-neutral-900 font-semibold truncate max-w-xs">{{ product.name }}</span>
    </nav>

    <!-- Main Product Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
      <!-- Gallery Column -->
      <div class="space-y-4">
        <!-- Main Feature Image Display -->
        <div class="w-full aspect-square bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200 shadow-sm relative group">
          <img
            :src="activeImage"
            :alt="product.name"
            class="w-full h-full object-cover object-center transition-all duration-300"
          />
          <span
            v-if="maxAvailableStock === 0"
            class="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow"
          >
            Stok Habis
          </span>
          <span
            v-else-if="maxAvailableStock <= 5"
            class="absolute top-4 left-4 bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow"
          >
            Sisa {{ maxAvailableStock }} pcs
          </span>
        </div>

        <!-- Image Thumbnails Strip -->
        <div v-if="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-2">
          <button
            v-for="(img, idx) in product.images"
            :key="img.id"
            @click="activeImageIndex = idx"
            class="w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0"
            :class="activeImageIndex === idx ? 'border-neutral-900 ring-2 ring-neutral-900/20' : 'border-neutral-200 hover:border-neutral-400'"
          >
            <img :src="img.imageUrl" :alt="product.name" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Product Information Column -->
      <div class="flex flex-col justify-between space-y-6">
        <div>
          <!-- Category & SKU Tag -->
          <div class="flex items-center gap-3">
            <NuxtLink
              v-if="product.categoryName"
              :to="`/shop/${product.categorySlug}`"
              class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"
            >
              {{ product.categoryName }}
            </NuxtLink>
            <span v-if="selectedVariant?.sku" class="text-xs text-neutral-400 font-mono">
              SKU: {{ selectedVariant.sku }}
            </span>
          </div>

          <!-- Product Title -->
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 mt-3 tracking-tight">
            {{ product.name }}
          </h1>

          <!-- Price Display -->
          <div class="mt-4 flex items-baseline gap-4">
            <span class="text-3xl sm:text-4xl font-black text-neutral-950">
              {{ formatRupiah(product.price) }}
            </span>
            <span class="text-xs text-neutral-500 font-medium">Harga Resmi Toko</span>
          </div>

          <!-- Variant: Colors -->
          <div v-if="availableColors.length > 0" class="mt-8">
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
              Pilihan Warna: <span class="text-neutral-900 font-bold capitalize">{{ selectedColor }}</span>
            </label>
            <div class="flex flex-wrap gap-2.5">
              <button
                v-for="color in availableColors"
                :key="color"
                @click="selectedColor = color"
                type="button"
                class="px-4 py-2 rounded-xl text-sm font-semibold border transition flex items-center gap-2"
                :class="selectedColor === color ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'"
              >
                <Check v-if="selectedColor === color" class="w-3.5 h-3.5" />
                <span>{{ color }}</span>
              </button>
            </div>
          </div>

          <!-- Variant: Sizes -->
          <div v-if="availableSizes.length > 0" class="mt-6">
            <div class="flex items-center justify-between mb-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                Pilihan Ukuran / Size: <span class="text-neutral-900 font-bold">{{ selectedSize }}</span>
              </label>
              <span class="text-xs text-neutral-400">
                Tersedia {{ maxAvailableStock }} stok
              </span>
            </div>

            <div class="flex flex-wrap gap-2.5">
              <button
                v-for="item in availableSizes"
                :key="item.id"
                @click="selectedSize = item.size"
                type="button"
                class="min-w-[50px] px-3.5 py-2 rounded-xl text-sm font-bold border transition text-center"
                :class="[
                  selectedSize === item.size
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400',
                  item.stock === 0 ? 'opacity-40 line-through cursor-not-allowed bg-neutral-100' : ''
                ]"
                :disabled="item.stock === 0"
              >
                {{ item.size }}
              </button>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="mt-6">
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">
              Jumlah Pembelian
            </label>
            <div class="flex items-center gap-4">
              <div class="flex items-center border border-neutral-300 rounded-xl bg-white p-1">
                <button
                  @click="decrementQty"
                  :disabled="quantity <= 1"
                  class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 transition"
                  aria-label="Kurangi"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <input
                  v-model.number="quantity"
                  type="text"
                  readonly
                  class="w-12 text-center text-sm font-bold text-neutral-900 bg-transparent focus:outline-none"
                />
                <button
                  @click="incrementQty"
                  :disabled="quantity >= maxAvailableStock"
                  class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 disabled:opacity-30 transition"
                  aria-label="Tambah"
                >
                  <Plus class="w-4 h-4" />
                </button>
              </div>

              <span v-if="maxAvailableStock > 0" class="text-xs text-neutral-500">
                Maks. {{ maxAvailableStock }} item untuk varian ini
              </span>
              <span v-else class="text-xs text-rose-600 font-bold">
                Stok varian ini habis
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Add to Cart Button -->
              <button
                @click="handleAddToCart"
                :disabled="maxAvailableStock <= 0"
                class="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <ShoppingBag class="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>

              <!-- Direct WhatsApp Button -->
              <button
                @click="handleDirectWhatsApp"
                :disabled="maxAvailableStock <= 0"
                class="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <MessageCircle class="w-5 h-5" />
                <span>Beli via WhatsApp</span>
              </button>
            </div>
          </div>

          <!-- Trust Value Guarantee Badges -->
          <div class="mt-8 pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4 text-center">
            <div class="flex flex-col items-center">
              <ShieldCheck class="w-5 h-5 text-neutral-700 mb-1" />
              <span class="text-[11px] font-bold text-neutral-800">100% Original</span>
              <span class="text-[10px] text-neutral-400">Garansi produk asli</span>
            </div>
            <div class="flex flex-col items-center">
              <Truck class="w-5 h-5 text-neutral-700 mb-1" />
              <span class="text-[11px] font-bold text-neutral-800">Kirim Seluruh RI</span>
              <span class="text-[10px] text-neutral-400">Ekspedisi terpercaya</span>
            </div>
            <div class="flex flex-col items-center">
              <RotateCcw class="w-5 h-5 text-neutral-700 mb-1" />
              <span class="text-[11px] font-bold text-neutral-800">Bisa Tukar Size</span>
              <span class="text-[10px] text-neutral-400">S&K berlaku</span>
            </div>
          </div>
        </div>

        <!-- Product Description Tab -->
        <div class="mt-8 pt-8 border-t border-neutral-200">
          <h2 class="text-lg font-bold text-neutral-900 mb-3">Deskripsi Produk</h2>
          <div class="prose prose-sm text-neutral-600 leading-relaxed whitespace-pre-line">
            {{ product.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Similar Products Section (FR-11) -->
    <section v-if="similarProducts && similarProducts.length > 0" class="mt-20 pt-12 border-t border-neutral-200">
      <div class="flex items-center justify-between mb-8">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">Rekomendasi</span>
          <h2 class="text-2xl font-black text-neutral-900 mt-1">Produk Serupa Pilihan</h2>
        </div>
        <NuxtLink :to="`/shop/${product.categorySlug}`" class="text-sm font-bold text-neutral-900 hover:underline">
          Lihat Kategori Ini &rarr;
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="sim in similarProducts"
          :key="sim.id"
          :product="sim"
        />
      </div>
    </section>
  </div>
</template>
