<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  AlertCircle,
  RefreshCw,
  Boxes
} from 'lucide-vue-next'
import { formatRupiah } from '~/composables/useCurrency'
import { useToast } from '~/composables/useToast'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useAdminRealtime } from '~/composables/useAdminRealtime'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { adminBase } = useAdminAuth()
const { stats, refreshStats } = useAdminRealtime()
const { showToast } = useToast()

const searchQuery = ref('')
const selectedStatus = ref('all')
const selectedCategory = ref('')
const currentPage = ref(1)
const isManualRefreshing = ref(false)

const deleteConfirmId = ref<number | null>(null)
const deleteProductName = ref('')

// Fetch categories for filter dropdown
const { data: categories, refresh: refreshCategories } = await useFetch('/api/admin/categories', {
  getCachedData: () => undefined
})

// Query params computed
const queryParams = computed(() => {
  const params: Record<string, any> = {
    page: currentPage.value,
    limit: 20
  }
  if (selectedStatus.value && selectedStatus.value !== 'all') {
    params.status = selectedStatus.value
  }
  if (selectedCategory.value) {
    params.categoryId = selectedCategory.value
  }
  if (searchQuery.value.trim()) {
    params.q = searchQuery.value.trim()
  }
  return params
})

const { data: response, refresh, status: fetchStatus } = await useFetch('/api/admin/products', {
  query: queryParams,
  watch: [queryParams],
  getCachedData: () => undefined,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
})

const handleManualRefresh = async () => {
  isManualRefreshing.value = true
  try {
    await Promise.all([refresh(), refreshCategories(), refreshStats()])
  } finally {
    isManualRefreshing.value = false
  }
}

// Auto sync interval every 4 seconds
let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  handleManualRefresh()
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refresh()
      refreshCategories()
      refreshStats()
    }
  }, 4000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

// Toggle publish/unpublish status (FR-17)
const toggleStatus = async (product: any) => {
  const nextStatus = product.status === 'published' ? 'draft' : 'published'
  try {
    await $fetch(`/api/admin/products/${product.id}/status`, {
      method: 'PATCH',
      body: { status: nextStatus }
    })
    product.status = nextStatus
    showToast(
      `Status produk diubah ke ${nextStatus === 'published' ? 'Tayang (Published)' : 'Draf (Draft)'}`,
      'success'
    )
    refreshStats()
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal mengubah status produk', 'error')
  }
}

// Delete product handler
const confirmDelete = (product: any) => {
  deleteConfirmId.value = product.id
  deleteProductName.value = product.name
}

const handleDelete = async () => {
  if (!deleteConfirmId.value) return
  try {
    await $fetch(`/api/admin/products/${deleteConfirmId.value}`, {
      method: 'DELETE'
    })
    showToast('Produk berhasil dihapus dari sistem.', 'success')
    deleteConfirmId.value = null
    await Promise.all([refresh(), refreshStats()])
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal menghapus produk', 'error')
  }
}

useHead({
  title: 'Kelola Produk - Admin Portal'
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header Title & Create Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Katalog Produk</h1>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-white">
            <span>{{ response?.pagination?.total ?? stats.totalProducts }} Total Produk</span>
          </span>
        </div>
        <p class="text-neutral-500 text-sm">
          Kelola informasi barang, upload foto, atur varian warna/ukuran, dan stok unit secara real-time.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="handleManualRefresh"
          :disabled="isManualRefreshing"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          title="Segarkan data produk sekarang"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isManualRefreshing }" />
          <span>{{ isManualRefreshing ? 'Menyinkronkan...' : 'Segarkan Data' }}</span>
        </button>

        <NuxtLink
          :to="`${adminBase}/products/new`"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Real-time Stats Quick Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-neutral-400 font-bold uppercase">Total Terdaftar</span>
          <div class="text-xl font-black text-neutral-900">{{ stats.totalProducts }}</div>
        </div>
        <div class="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold text-xs">
          All
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-neutral-400 font-bold uppercase">Tayang (Published)</span>
          <div class="text-xl font-black text-emerald-600">{{ stats.publishedProducts }}</div>
        </div>
        <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
          <Eye class="w-4 h-4" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-neutral-400 font-bold uppercase">Draf (Draft)</span>
          <div class="text-xl font-black text-neutral-700">{{ stats.draftProducts }}</div>
        </div>
        <div class="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center font-bold text-xs">
          <EyeOff class="w-4 h-4" />
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div>
          <span class="text-[11px] text-neutral-400 font-bold uppercase">Total Stok Fisik</span>
          <div class="text-xl font-black text-sky-600">{{ stats.totalStockUnits }}</div>
        </div>
        <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
          <Boxes class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama produk..."
            class="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
          />
          <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
        </div>

        <!-- Category Filter -->
        <div>
          <select
            v-model="selectedCategory"
            class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 bg-white"
          >
            <option value="">Semua Kategori ({{ categories?.length || 0 }})</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.productCount }} produk)
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 bg-white"
          >
            <option value="all">Semua Status Publikasi</option>
            <option value="published">Tayang ({{ stats.publishedProducts }})</option>
            <option value="draft">Draf ({{ stats.draftProducts }})</option>
            <option value="archived">Arsip ({{ stats.archivedProducts }})</option>
          </select>
        </div>
      </div>

      <!-- Products Table -->
      <div class="overflow-x-auto pt-2">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <th class="pb-3 font-bold">Produk</th>
              <th class="pb-3 font-bold">Kategori</th>
              <th class="pb-3 font-bold">Harga</th>
              <th class="pb-3 font-bold">Stok & Varian</th>
              <th class="pb-3 font-bold">Status</th>
              <th class="pb-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="prod in response?.products"
              :key="prod.id"
              class="hover:bg-neutral-50/80 transition"
            >
              <!-- Thumbnail & Name -->
              <td class="py-4">
                <div class="flex items-center gap-3 max-w-sm">
                  <img
                    v-if="prod.primaryImage"
                    :src="prod.primaryImage"
                    :alt="prod.name"
                    class="w-12 h-12 object-cover rounded-xl bg-neutral-100 border border-neutral-100 shrink-0"
                  />
                  <div class="w-12 h-12 rounded-xl bg-neutral-100 shrink-0 flex items-center justify-center text-neutral-300 text-xs" v-else>
                    No Image
                  </div>
                  <div>
                    <span class="font-bold text-neutral-900 block line-clamp-1">{{ prod.name }}</span>
                    <span class="text-[11px] text-neutral-400 font-mono">/product/{{ prod.slug }}</span>
                  </div>
                </div>
              </td>

              <!-- Category -->
              <td class="py-4 text-xs text-neutral-600">
                <span class="bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                  {{ prod.categoryName || 'Tanpa Kategori' }}
                </span>
              </td>

              <!-- Price -->
              <td class="py-4 font-bold text-neutral-900 text-xs whitespace-nowrap">
                {{ formatRupiah(prod.price) }}
              </td>

              <!-- Stock & Variant Count -->
              <td class="py-4 text-xs">
                <div class="flex items-center gap-2">
                  <span
                    class="font-black px-2 py-0.5 rounded-full text-[11px]"
                    :class="{
                      'bg-rose-100 text-rose-800': prod.totalStock === 0,
                      'bg-amber-100 text-amber-800': prod.totalStock > 0 && prod.totalStock <= 5,
                      'bg-emerald-100 text-emerald-800': prod.totalStock > 5
                    }"
                  >
                    {{ prod.totalStock === 0 ? 'Habis' : `${prod.totalStock} pcs` }}
                  </span>
                  <span class="text-neutral-400">({{ prod.variantCount }} varian)</span>
                </div>
              </td>

              <!-- Status Toggle (FR-17) -->
              <td class="py-4">
                <button
                  @click="toggleStatus(prod)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer"
                  :class="{
                    'bg-emerald-100 text-emerald-800 hover:bg-emerald-200': prod.status === 'published',
                    'bg-neutral-200 text-neutral-700 hover:bg-neutral-300': prod.status === 'draft',
                    'bg-rose-100 text-rose-800 hover:bg-rose-200': prod.status === 'archived'
                  }"
                  title="Klik untuk mengubah status publikasi"
                >
                  <Eye v-if="prod.status === 'published'" class="w-3 h-3" />
                  <EyeOff v-else class="w-3 h-3" />
                  <span>{{ prod.status === 'published' ? 'Tayang' : prod.status === 'draft' ? 'Draf' : 'Arsip' }}</span>
                </button>
              </td>

              <!-- Actions -->
              <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`${adminBase}/products/${prod.id}/edit`"
                    class="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                    title="Edit Produk"
                  >
                    <Edit class="w-4 h-4" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/product/${prod.slug}`"
                    target="_blank"
                    class="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                    title="Buka Halaman Publik"
                  >
                    <ExternalLink class="w-4 h-4" />
                  </NuxtLink>
                  <button
                    @click="confirmDelete(prod)"
                    class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!response?.products || response.products.length === 0">
              <td colspan="6" class="py-12 text-center text-neutral-400 text-sm">
                Tidak ada produk ditemukan sesuai filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="response?.pagination && response.pagination.totalPages > 1"
        class="flex items-center justify-center gap-2 pt-4 border-t border-neutral-100"
      >
        <button
          v-for="p in response.pagination.totalPages"
          :key="p"
          @click="currentPage = p"
          class="w-9 h-9 rounded-xl font-bold text-xs transition"
          :class="currentPage === p ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="deleteConfirmId"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-lg text-neutral-900">Hapus Produk?</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">
          Apakah Anda yakin ingin menghapus <b>{{ deleteProductName }}</b>? Seluruh gambar dan varian terkait akan ikut terhapus.
        </p>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            @click="deleteConfirmId = null"
            class="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
          >
            Batal
          </button>
          <button
            @click="handleDelete"
            class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow transition"
          >
            Hapus Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
