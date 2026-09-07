<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Filter states from route query or defaults
const selectedCategory = ref((route.query.category as string) || '')
const sortBy = ref((route.query.sort as string) || 'newest')
const minPrice = ref((route.query.minPrice as string) || '')
const maxPrice = ref((route.query.maxPrice as string) || '')
const currentPage = ref(Number(route.query.page) || 1)
const searchQuery = ref((route.query.q as string) || '')

const showMobileFilter = ref(false)

// Fetch categories for filter dropdown
const { data: categories } = await useFetch('/api/categories')

// Query params computed
const queryParams = computed(() => {
  const params: Record<string, string> = {
    sort: sortBy.value,
    page: String(currentPage.value),
    limit: '12',
  }
  if (selectedCategory.value) params.category = selectedCategory.value
  if (minPrice.value) params.minPrice = minPrice.value
  if (maxPrice.value) params.maxPrice = maxPrice.value
  if (searchQuery.value) params.q = searchQuery.value
  return params
})

// Fetch products with reactive query params
const { data: response, status } = await useFetch('/api/products', {
  query: queryParams,
  watch: [queryParams],
})

// Sync query params back to URL for shareability & SEO
const applyFilters = () => {
  currentPage.value = 1
  router.push({
    path: '/shop',
    query: {
      ...(selectedCategory.value && { category: selectedCategory.value }),
      ...(sortBy.value !== 'newest' && { sort: sortBy.value }),
      ...(minPrice.value && { minPrice: minPrice.value }),
      ...(maxPrice.value && { maxPrice: maxPrice.value }),
      ...(searchQuery.value && { q: searchQuery.value }),
    }
  })
  showMobileFilter.value = false
}

const resetFilters = () => {
  selectedCategory.value = ''
  sortBy.value = 'newest'
  minPrice.value = ''
  maxPrice.value = ''
  searchQuery.value = ''
  currentPage.value = 1
  router.push({ path: '/shop' })
}

const setCategory = (slug: string) => {
  selectedCategory.value = slug
  applyFilters()
}

useHead({
  title: 'Katalog Produk Lengkap - ModaStore',
  meta: [
    {
      name: 'description',
      content: 'Temukan pilihan kaos, kemeja, celana, jaket, dan aksesoris fashion berkualitas dengan harga terjangkau.'
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Header Title & Filter Toggle for Mobile -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-200">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-neutral-900">Katalog Produk</h1>
        <p class="text-neutral-500 text-sm mt-1">
          Menampilkan {{ response?.products?.length || 0 }} dari {{ response?.pagination?.total || 0 }} produk yang tersedia
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Sort Dropdown -->
        <div class="relative flex items-center">
          <label for="sortSelect" class="sr-only">Urutkan</label>
          <select
            id="sortSelect"
            v-model="sortBy"
            @change="applyFilters"
            class="pl-3 pr-8 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-neutral-700"
          >
            <option value="newest">Terbaru</option>
            <option value="price-low">Harga: Rendah ke Tinggi</option>
            <option value="price-high">Harga: Tinggi ke Rendah</option>
            <option value="name">Nama: A - Z</option>
          </select>
        </div>

        <!-- Mobile Filter Button -->
        <button
          @click="showMobileFilter = true"
          class="lg:hidden px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>
    </div>

    <!-- Active Filter Chips -->
    <div v-if="selectedCategory || minPrice || maxPrice || searchQuery" class="flex flex-wrap items-center gap-2 pt-4">
      <span class="text-xs text-neutral-400 font-medium">Filter Aktif:</span>
      <span
        v-if="selectedCategory"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold"
      >
        Kategori: {{ categories?.find(c => c.slug === selectedCategory)?.name || selectedCategory }}
        <button @click="selectedCategory = ''; applyFilters()"><X class="w-3.5 h-3.5" /></button>
      </span>
      <span
        v-if="searchQuery"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold"
      >
        Kata kunci: "{{ searchQuery }}"
        <button @click="searchQuery = ''; applyFilters()"><X class="w-3.5 h-3.5" /></button>
      </span>
      <span
        v-if="minPrice || maxPrice"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold"
      >
        Harga: {{ minPrice || '0' }} - {{ maxPrice || 'Maks' }}
        <button @click="minPrice = ''; maxPrice = ''; applyFilters()"><X class="w-3.5 h-3.5" /></button>
      </span>
      <button
        @click="resetFilters"
        class="text-xs text-rose-600 font-semibold hover:underline ml-2"
      >
        Reset Semua
      </button>
    </div>

    <!-- Main Content Layout (Sidebar + Product Grid) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
      <!-- Desktop Sidebar Filter -->
      <aside class="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-neutral-200 h-fit">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 class="font-bold text-neutral-900 text-base flex items-center gap-2">
            <Filter class="w-4 h-4" /> Filter Produk
          </h3>
          <button @click="resetFilters" class="text-xs text-neutral-400 hover:text-neutral-900">Reset</button>
        </div>

        <!-- Search in catalog -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Pencarian</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              @keydown.enter.prevent="applyFilters"
              type="text"
              placeholder="Ketik kata kunci..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
            <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Kategori</label>
          <div class="space-y-1">
            <button
              @click="setCategory('')"
              class="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center justify-between"
              :class="!selectedCategory ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'"
            >
              <span>Semua Kategori</span>
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="setCategory(cat.slug)"
              class="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center justify-between"
              :class="selectedCategory === cat.slug ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'"
            >
              <span>{{ cat.name }}</span>
              <span class="text-xs opacity-70">{{ cat.productCount || 0 }}</span>
            </button>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Rentang Harga (Rp)</label>
          <div class="space-y-2">
            <input
              v-model="minPrice"
              type="number"
              placeholder="Harga Minimum (cth: 50000)"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
            <input
              v-model="maxPrice"
              type="number"
              placeholder="Harga Maksimum (cth: 250000)"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
            <button
              @click="applyFilters"
              class="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition mt-2"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </aside>

      <!-- Products Grid Section -->
      <section class="lg:col-span-3">
        <div v-if="status === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-pulse">
          <div v-for="i in 6" :key="i" class="bg-neutral-200 aspect-square rounded-2xl"></div>
        </div>

        <div v-else-if="response?.products?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          <ProductCard
            v-for="prod in response.products"
            :key="prod.id"
            :product="prod"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
          <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Filter class="w-8 h-8" />
          </div>
          <h3 class="font-bold text-lg text-neutral-900">Produk Tidak Ditemukan</h3>
          <p class="text-neutral-500 text-sm mt-1 max-w-md mx-auto">
            Tidak ada produk yang cocok dengan filter atau kata kunci pencarian Anda. Coba atur ulang filter Anda.
          </p>
          <button
            @click="resetFilters"
            class="mt-4 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition"
          >
            Reset Semua Filter
          </button>
        </div>

        <!-- Pagination -->
        <div
          v-if="response?.pagination && response.pagination.totalPages > 1"
          class="flex items-center justify-center gap-2 mt-10"
        >
          <button
            v-for="p in response.pagination.totalPages"
            :key="p"
            @click="currentPage = p; applyFilters()"
            class="w-10 h-10 rounded-xl font-bold text-sm transition"
            :class="currentPage === p ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'"
          >
            {{ p }}
          </button>
        </div>
      </section>
    </div>

    <!-- Mobile Filter Drawer Modal -->
    <div
      v-if="showMobileFilter"
      class="fixed inset-0 z-50 bg-black/50 flex justify-end"
    >
      <div class="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-neutral-200">
          <h3 class="font-bold text-lg text-neutral-900">Filter Produk</h3>
          <button @click="showMobileFilter = false" class="p-1 rounded-lg hover:bg-neutral-100">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Kategori</label>
          <div class="space-y-1">
            <button
              @click="selectedCategory = ''"
              class="w-full text-left px-3 py-2 rounded-xl text-sm font-medium"
              :class="!selectedCategory ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'"
            >
              Semua Kategori
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.slug"
              class="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between"
              :class="selectedCategory === cat.slug ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'"
            >
              <span>{{ cat.name }}</span>
              <span class="text-xs opacity-70">{{ cat.productCount || 0 }}</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Rentang Harga</label>
          <div class="space-y-2">
            <input
              v-model="minPrice"
              type="number"
              placeholder="Harga Minimum"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl"
            />
            <input
              v-model="maxPrice"
              type="number"
              placeholder="Harga Maksimum"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl"
            />
          </div>
        </div>

        <div class="pt-4 space-y-2">
          <button
            @click="applyFilters"
            class="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm"
          >
            Terapkan Filter
          </button>
          <button
            @click="resetFilters"
            class="w-full py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
