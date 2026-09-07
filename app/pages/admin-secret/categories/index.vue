<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useAdminRealtime } from '~/composables/useAdminRealtime'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { showToast } = useToast()
const { stats, refreshStats } = useAdminRealtime()

const { data: categories, refresh, status } = await useFetch('/api/admin/categories', {
  getCachedData: () => undefined,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
})

const searchQuery = ref('')
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isManualRefreshing = ref(false)
const editingId = ref<number | null>(null)
const formName = ref('')
const formSlug = ref('')
const isSlugManuallyEdited = ref(false)

const deleteConfirmId = ref<number | null>(null)
const deleteCategoryName = ref('')

const handleManualRefresh = async () => {
  isManualRefreshing.value = true
  try {
    await Promise.all([refresh(), refreshStats()])
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
      refreshStats()
    }
  }, 4000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const filteredCategories = computed(() => {
  if (!categories.value) return []
  if (!searchQuery.value.trim()) return categories.value
  const q = searchQuery.value.toLowerCase()
  return categories.value.filter(
    (c: any) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  )
})

const handleNameInput = () => {
  if (!isSlugManuallyEdited.value) {
    formSlug.value = formName.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
}

const openCreateModal = () => {
  editingId.value = null
  formName.value = ''
  formSlug.value = ''
  isSlugManuallyEdited.value = false
  isModalOpen.value = true
}

const openEditModal = (cat: any) => {
  editingId.value = cat.id
  formName.value = cat.name
  formSlug.value = cat.slug
  isSlugManuallyEdited.value = true
  isModalOpen.value = true
}

const handleSaveCategory = async () => {
  if (!formName.value.trim()) {
    showToast('Nama kategori wajib diisi.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/categories/${editingId.value}`, {
        method: 'PUT',
        body: { name: formName.value, slug: formSlug.value }
      })
      showToast('Kategori berhasil diperbarui!', 'success')
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: { name: formName.value, slug: formSlug.value }
      })
      showToast('Kategori baru berhasil ditambahkan!', 'success')
    }
    isModalOpen.value = false
    await Promise.all([refresh(), refreshStats()])
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal menyimpan kategori', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (cat: any) => {
  deleteConfirmId.value = cat.id
  deleteCategoryName.value = cat.name
}

const handleDelete = async () => {
  if (!deleteConfirmId.value) return
  try {
    await $fetch(`/api/admin/categories/${deleteConfirmId.value}`, {
      method: 'DELETE'
    })
    showToast('Kategori berhasil dihapus.', 'success')
    deleteConfirmId.value = null
    await Promise.all([refresh(), refreshStats()])
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal menghapus kategori', 'error')
  }
}

useHead({
  title: 'Kelola Kategori - Admin Portal'
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Kelola Kategori</h1>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-white">
            <span>{{ categories?.length || 0 }} Kategori</span>
          </span>
        </div>
        <p class="text-neutral-500 text-sm">
          Daftar seluruh kategori produk beserta jumlah produk terkait yang diperbarui secara real-time.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="handleManualRefresh"
          :disabled="isManualRefreshing"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          title="Segarkan data sekarang"
        >
          <RefreshCw class="w-3.5 h-3.5 text-neutral-500" :class="{ 'animate-spin': isManualRefreshing }" />
          <span>{{ isManualRefreshing ? 'Menyinkronkan...' : 'Segarkan Data' }}</span>
        </button>

        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition self-start sm:self-auto cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>
    </div>

    <!-- Search & List Table -->
    <div class="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="relative w-full max-w-xs">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kategori..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
          />
          <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
        <span class="text-xs text-neutral-500 font-medium">
          {{ filteredCategories.length }} kategori ditampilkan
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <th class="pb-3 font-bold">Nama Kategori</th>
              <th class="pb-3 font-bold">Slug URL</th>
              <th class="pb-3 font-bold">Jumlah Produk Terkait</th>
              <th class="pb-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr
              v-for="cat in filteredCategories"
              :key="cat.id"
              class="hover:bg-neutral-50/80 transition"
            >
              <td class="py-4 font-bold text-neutral-900">
                {{ cat.name }}
              </td>
              <td class="py-4 font-mono text-xs text-neutral-500">
                /shop/{{ cat.slug }}
              </td>
              <td class="py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                  :class="cat.productCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'"
                >
                  {{ cat.productCount || 0 }} produk
                </span>
              </td>
              <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="openEditModal(cat)"
                    class="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                    title="Edit Kategori"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(cat)"
                    class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCategories.length === 0">
              <td colspan="4" class="py-8 text-center text-neutral-400 text-sm">
                Tidak ada kategori ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
          <h3 class="font-bold text-lg text-neutral-900">
            {{ editingId ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
          </h3>
          <button @click="isModalOpen = false" class="p-1 rounded-lg text-neutral-400 hover:text-neutral-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSaveCategory" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Nama Kategori <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="formName"
              @input="handleNameInput"
              type="text"
              required
              class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="cth: Jaket & Hoodie"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Slug URL (SEO Friendly) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="formSlug"
              @input="isSlugManuallyEdited = true"
              type="text"
              required
              class="w-full px-4 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="cth: jaket-hoodie"
            />
            <p class="text-[11px] text-neutral-400 mt-1">Otomatis digenerate dari nama kategori, atau edit manual.</p>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-sm font-bold shadow transition"
            >
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Kategori' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deleteConfirmId"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-lg text-neutral-900">Hapus Kategori?</h3>
        <p class="text-xs text-neutral-500 leading-relaxed">
          Apakah Anda yakin ingin menghapus kategori <b>{{ deleteCategoryName }}</b>? Produk dalam kategori ini akan diubah kategorinya menjadi tanpa kategori.
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
            Hapus Kategori
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
