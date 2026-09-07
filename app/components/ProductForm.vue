<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Layers,
  Sparkles,
  X
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useAdminRealtime } from '~/composables/useAdminRealtime'

interface ProductVariantForm {
  id?: number
  color: string
  size: string
  stock: number
  sku: string
}

interface ProductFormData {
  id?: number
  name: string
  slug: string
  description: string
  price: number
  categoryId: number | null
  status: string
  images: string[]
  variants: ProductVariantForm[]
}

const props = defineProps<{
  initialData?: ProductFormData
  isEdit?: boolean
}>()

const { adminBase } = useAdminAuth()
const { refreshStats } = useAdminRealtime()
const { showToast } = useToast()
const router = useRouter()

// Fetch categories
const { data: categories } = await useFetch('/api/admin/categories')

// Form state
const name = ref(props.initialData?.name || '')
const slug = ref(props.initialData?.slug || '')
const description = ref(props.initialData?.description || '')
const price = ref(props.initialData?.price || 0)
const categoryId = ref<number | null>(props.initialData?.categoryId || null)
const status = ref(props.initialData?.status || 'published')
const images = ref<string[]>(props.initialData?.images ? [...props.initialData.images] : [])
const variants = ref<ProductVariantForm[]>(
  props.initialData?.variants && props.initialData.variants.length > 0
    ? JSON.parse(JSON.stringify(props.initialData.variants))
    : [{ color: 'Hitam', size: 'M', stock: 10, sku: '' }]
)

const isSlugManuallyEdited = ref(Boolean(props.isEdit))
const isUploading = ref(false)
const isSaving = ref(false)
const imageUrlInput = ref('')

const handleNameInput = () => {
  if (!isSlugManuallyEdited.value) {
    slug.value = name.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
}

// Image upload handler
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  try {
    const res = await $fetch<{ success: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    if (res.url) {
      images.value.push(res.url)
      showToast('Gambar berhasil diunggah!', 'success')
    }
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal mengunggah gambar', 'error')
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const addImageUrl = () => {
  if (imageUrlInput.value.trim()) {
    images.value.push(imageUrlInput.value.trim())
    imageUrlInput.value = ''
  }
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

// Variant management
const addVariant = () => {
  variants.value.push({
    color: 'Hitam',
    size: 'L',
    stock: 10,
    sku: ''
  })
}

const removeVariant = (index: number) => {
  if (variants.value.length === 1) {
    showToast('Minimal harus memiliki 1 varian produk.', 'error')
    return
  }
  variants.value.splice(index, 1)
}

const generatePresetSizes = (color: string) => {
  const sizes = ['S', 'M', 'L', 'XL']
  variants.value = variants.value.filter(v => v.color !== color)
  for (const s of sizes) {
    variants.value.push({
      color,
      size: s,
      stock: 10,
      sku: ''
    })
  }
  showToast(`Varian ${sizes.join(', ')} untuk warna ${color} berhasil ditambahkan.`, 'info')
}

// Save handler
const handleSubmit = async () => {
  if (!name.value.trim()) {
    showToast('Nama produk wajib diisi', 'error')
    return
  }
  if (price.value <= 0) {
    showToast('Harga produk harus lebih dari 0', 'error')
    return
  }
  if (variants.value.length === 0) {
    showToast('Minimal harus menambahkan 1 varian dan stok', 'error')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      name: name.value.trim(),
      slug: slug.value.trim(),
      description: description.value.trim(),
      price: Number(price.value),
      categoryId: categoryId.value,
      status: status.value,
      images: images.value,
      variants: variants.value
    }

    if (props.isEdit && props.initialData?.id) {
      await $fetch(`/api/admin/products/${props.initialData.id}`, {
        method: 'PUT',
        body: payload
      })
      showToast('Produk berhasil diperbarui!', 'success')
    } else {
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: payload
      })
      showToast('Produk baru berhasil disimpan!', 'success')
    }

    await refreshStats()
    router.push(`${adminBase}/products`)
  } catch (err: any) {
    showToast(err.data?.statusMessage || err.message || 'Gagal menyimpan produk', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-8 max-w-5xl mx-auto">
    <!-- Top actions bar -->
    <div class="flex items-center justify-between pb-6 border-b border-neutral-200">
      <NuxtLink
        :to="`${adminBase}/products`"
        class="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Kembali ke Daftar Produk</span>
      </NuxtLink>

      <button
        type="submit"
        :disabled="isSaving"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer"
      >
        <Save class="w-4 h-4" />
        <span>{{ isSaving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk') }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Details & Images & Variants -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Basic Info Card -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <h3 class="font-bold text-neutral-900 text-lg border-b border-neutral-100 pb-3">
            Informasi Produk
          </h3>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Nama Produk <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="name"
              @input="handleNameInput"
              type="text"
              required
              class="w-full px-4 py-3 text-base border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="cth: Kaos Oversize Heavy Cotton 24s"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Slug URL (Otomatis) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="slug"
              @input="isSlugManuallyEdited = true"
              type="text"
              required
              class="w-full px-4 py-2.5 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="kaos-oversize-heavy-cotton"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Deskripsi Produk
            </label>
            <textarea
              v-model="description"
              rows="5"
              class="w-full px-4 py-3 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 leading-relaxed"
              placeholder="Jelaskan spesifikasi bahan, ukuran, dan keunggulan produk secara detail..."
            ></textarea>
          </div>
        </div>

        <!-- Product Images Card (FR-16) -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 class="font-bold text-neutral-900 text-lg">Foto Produk (FR-16)</h3>
              <p class="text-xs text-neutral-400 mt-0.5">Unggah foto atau masukkan link gambar online</p>
            </div>
          </div>

          <!-- Upload Drop Area -->
          <div class="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center hover:border-neutral-500 transition bg-neutral-50">
            <Upload class="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p class="text-sm font-semibold text-neutral-700">Pilih file gambar dari komputer Anda</p>
            <p class="text-xs text-neutral-400 mt-1">Mendukung format JPG, PNG, WEBP</p>
            
            <label class="mt-4 inline-block px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition cursor-pointer">
              <span v-if="isUploading">Mengunggah...</span>
              <span v-else>Telusuri File</span>
              <input
                type="file"
                accept="image/*"
                @change="handleFileUpload"
                class="hidden"
                :disabled="isUploading"
              />
            </label>
          </div>

          <!-- Add Image by URL input -->
          <div class="flex gap-2">
            <input
              v-model="imageUrlInput"
              type="url"
              placeholder="Atau tempel URL gambar (https://...)"
              class="flex-grow px-3.5 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
            />
            <button
              type="button"
              @click="addImageUrl"
              class="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold"
            >
              Tambah URL
            </button>
          </div>

          <!-- Image Previews List -->
          <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div
              v-for="(img, idx) in images"
              :key="idx"
              class="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 group bg-neutral-100 shadow-xs"
            >
              <img :src="img" alt="Foto produk" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  @click="removeImage(idx)"
                  class="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                  title="Hapus gambar"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              <span v-if="idx === 0" class="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                Foto Utama
              </span>
            </div>
          </div>
        </div>

        <!-- Variants & Stock Management Card (FR-06, FR-15) -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-3">
            <div>
              <h3 class="font-bold text-neutral-900 text-lg flex items-center gap-2">
                <Layers class="w-5 h-5 text-neutral-700" />
                <span>Varian & Pengaturan Stok (FR-15)</span>
              </h3>
              <p class="text-xs text-neutral-400 mt-0.5">Tentukan variasi warna, ukuran, SKU, dan stok unit</p>
            </div>

            <button
              type="button"
              @click="addVariant"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Varian</span>
            </button>
          </div>

          <!-- Variant Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th class="pb-2 font-bold">Warna</th>
                  <th class="pb-2 font-bold">Ukuran / Size</th>
                  <th class="pb-2 font-bold">Stok Unit</th>
                  <th class="pb-2 font-bold">SKU (Kode)</th>
                  <th class="pb-2 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="(v, index) in variants" :key="index">
                  <td class="py-2.5 pr-2">
                    <input
                      v-model="v.color"
                      type="text"
                      placeholder="cth: Hitam"
                      class="w-full px-2.5 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-xs"
                      required
                    />
                  </td>
                  <td class="py-2.5 pr-2">
                    <input
                      v-model="v.size"
                      type="text"
                      placeholder="cth: L"
                      class="w-20 px-2.5 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-xs"
                      required
                    />
                  </td>
                  <td class="py-2.5 pr-2">
                    <input
                      v-model.number="v.stock"
                      type="number"
                      min="0"
                      class="w-20 px-2.5 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-xs font-bold"
                      required
                    />
                  </td>
                  <td class="py-2.5 pr-2">
                    <input
                      v-model="v.sku"
                      type="text"
                      placeholder="Otomatis"
                      class="w-28 px-2.5 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-xs font-mono"
                    />
                  </td>
                  <td class="py-2.5 text-right">
                    <button
                      type="button"
                      @click="removeVariant(index)"
                      class="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md transition"
                      title="Hapus baris varian"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Price, Category, Status Sidebar -->
      <div class="space-y-6">
        <!-- Status & Visibility Card (FR-17) -->
        <div class="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <h4 class="font-bold text-neutral-900 text-sm pb-2 border-b border-neutral-100">
            Status Publikasi (FR-17)
          </h4>

          <div class="space-y-2">
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
              :class="status === 'published' ? 'border-emerald-600 bg-emerald-50/50' : 'border-neutral-200 hover:bg-neutral-50'"
            >
              <input type="radio" v-model="status" value="published" class="text-emerald-600" />
              <div>
                <span class="block text-xs font-bold text-neutral-900">Published (Tayang)</span>
                <span class="text-[11px] text-neutral-500">Muncul di etalase toko dan siap dibeli</span>
              </div>
            </label>

            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
              :class="status === 'draft' ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200 hover:bg-neutral-50'"
            >
              <input type="radio" v-model="status" value="draft" class="text-neutral-900" />
              <div>
                <span class="block text-xs font-bold text-neutral-900">Draft (Draf)</span>
                <span class="text-[11px] text-neutral-500">Disimpan tetapi belum ditampilkan ke publik</span>
              </div>
            </label>

            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition"
              :class="status === 'archived' ? 'border-rose-500 bg-rose-50/50' : 'border-neutral-200 hover:bg-neutral-50'"
            >
              <input type="radio" v-model="status" value="archived" class="text-rose-600" />
              <div>
                <span class="block text-xs font-bold text-neutral-900">Archived (Arsip)</span>
                <span class="text-[11px] text-neutral-500">Tidak dijual sementara</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Pricing Card -->
        <div class="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <h4 class="font-bold text-neutral-900 text-sm pb-2 border-b border-neutral-100">
            Penetapan Harga
          </h4>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Harga Produk (Rp) <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-xs font-bold text-neutral-400">Rp</span>
              <input
                v-model.number="price"
                type="number"
                min="1000"
                step="500"
                required
                class="w-full pl-10 pr-4 py-2.5 text-sm font-bold border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="129000"
              />
            </div>
          </div>
        </div>

        <!-- Category Card -->
        <div class="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h4 class="font-bold text-neutral-900 text-sm">Kategori</h4>
            <NuxtLink :to="`${adminBase}/categories`" class="text-xs text-emerald-600 hover:underline">
              + Baru
            </NuxtLink>
          </div>

          <div>
            <select
              v-model="categoryId"
              class="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-neutral-700 bg-white"
            >
              <option :value="null">-- Tanpa Kategori --</option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Submit Button in sidebar -->
        <button
          type="submit"
          :disabled="isSaving"
          class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          <span>{{ isSaving ? 'Menyimpan...' : (isEdit ? 'Perbarui Produk' : 'Simpan Produk Baru') }}</span>
        </button>
      </div>
    </div>
  </form>
</template>
