<script setup lang="ts">
import {
  Package,
  FolderTree,
  AlertTriangle,
  Boxes,
  Plus,
  ArrowRight,
  Edit,
  ExternalLink,
  CheckCircle2
} from 'lucide-vue-next'
import { formatRupiah } from '~/composables/useCurrency'
import { useAdminAuth } from '~/composables/useAdminAuth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { adminBase } = useAdminAuth()

const { data: dashboard, refresh } = await useFetch('/api/admin/dashboard')

useHead({
  title: 'Dashboard Admin - ModaStore'
})
</script>

<template>
  <div class="space-y-8">
    <!-- Top Welcome Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Dashboard Ringkasan</h1>
        <p class="text-neutral-500 text-sm mt-1">
          Pantau stok produk, status katalog, dan statistik toko Anda secara real-time.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          :to="`${adminBase}/products/new`"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Produk</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Metric Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Total Products -->
      <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Produk</span>
          <div class="text-3xl font-black text-neutral-900 mt-1">
            {{ dashboard?.stats?.totalProducts || 0 }}
          </div>
          <span class="text-xs text-neutral-500 mt-1 block">
            {{ dashboard?.stats?.publishedProducts || 0 }} tayang &bull; {{ dashboard?.stats?.draftProducts || 0 }} draf
          </span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <Package class="w-6 h-6" />
        </div>
      </div>

      <!-- Card 2: Total Categories -->
      <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Kategori</span>
          <div class="text-3xl font-black text-neutral-900 mt-1">
            {{ dashboard?.stats?.totalCategories || 0 }}
          </div>
          <NuxtLink :to="`${adminBase}/categories`" class="text-xs text-emerald-600 hover:underline mt-1 block font-medium">
            Kelola kategori &rarr;
          </NuxtLink>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <FolderTree class="w-6 h-6" />
        </div>
      </div>

      <!-- Card 3: Total Stock Units -->
      <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Unit Stok</span>
          <div class="text-3xl font-black text-neutral-900 mt-1">
            {{ dashboard?.stats?.totalStockUnits || 0 }}
          </div>
          <span class="text-xs text-neutral-500 mt-1 block">
            Dari {{ dashboard?.stats?.totalVariants || 0 }} varian produk
          </span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Boxes class="w-6 h-6" />
        </div>
      </div>

      <!-- Card 4: Low Stock Alert -->
      <div class="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Peringatan Stok</span>
          <div class="text-3xl font-black text-rose-600 mt-1">
            {{ dashboard?.stats?.lowStockCount || 0 }}
          </div>
          <span class="text-xs text-neutral-500 mt-1 block">
            Varian stok &le; 5 unit
          </span>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Low Stock Alert Warning Box -->
    <div
      v-if="dashboard?.lowStockItems && dashboard.lowStockItems.length > 0"
      class="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm"
    >
      <div class="flex items-center gap-2 text-amber-800 font-bold mb-4">
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0" />
        <h3 class="text-base">Perlu Restok: Varian Dengan Stok Menipis</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in dashboard.lowStockItems"
          :key="item.variantId"
          class="bg-white p-4 rounded-2xl border border-amber-100 flex items-center justify-between gap-3 shadow-xs"
        >
          <div class="flex items-center gap-3">
            <img
              v-if="item.primaryImage"
              :src="item.primaryImage"
              :alt="item.productName"
              class="w-12 h-12 object-cover rounded-xl bg-neutral-100"
            />
            <div>
              <h4 class="font-bold text-xs text-neutral-900 line-clamp-1">{{ item.productName }}</h4>
              <p class="text-[11px] text-neutral-500">
                {{ item.color }} &bull; Size {{ item.size }}
              </p>
            </div>
          </div>

          <div class="text-right shrink-0">
            <span
              class="inline-block px-2.5 py-1 rounded-full text-xs font-black"
              :class="item.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'"
            >
              {{ item.stock === 0 ? 'Habis (0)' : `Sisa ${item.stock}` }}
            </span>
            <NuxtLink
              :to="`${adminBase}/products/${item.productId}/edit`"
              class="block text-[11px] text-emerald-600 hover:underline mt-1 font-semibold"
            >
              Update &rarr;
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Products Table -->
    <div class="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div>
          <h2 class="text-lg font-bold text-neutral-900">Produk Terakhir Ditambahkan</h2>
          <p class="text-xs text-neutral-500">Daftar produk terbaru di katalog Anda</p>
        </div>
        <NuxtLink
          :to="`${adminBase}/products`"
          class="text-xs font-bold text-neutral-900 hover:underline inline-flex items-center gap-1"
        >
          <span>Lihat Semua Produk</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
              <th class="pb-3 font-bold">Produk</th>
              <th class="pb-3 font-bold">Kategori</th>
              <th class="pb-3 font-bold">Harga</th>
              <th class="pb-3 font-bold">Total Stok</th>
              <th class="pb-3 font-bold">Status</th>
              <th class="pb-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="prod in dashboard?.recentProducts" :key="prod.id" class="hover:bg-neutral-50/80 transition">
              <td class="py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="prod.primaryImage"
                    :src="prod.primaryImage"
                    :alt="prod.name"
                    class="w-10 h-10 object-cover rounded-xl bg-neutral-100 border border-neutral-100"
                  />
                  <div>
                    <span class="font-bold text-neutral-900 block line-clamp-1">{{ prod.name }}</span>
                    <span class="text-[11px] text-neutral-400 font-mono">/{{ prod.slug }}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 text-neutral-600 text-xs">
                {{ prod.categoryName || '-' }}
              </td>
              <td class="py-4 font-bold text-neutral-900 text-xs">
                {{ formatRupiah(prod.price) }}
              </td>
              <td class="py-4 text-xs font-medium text-neutral-700">
                {{ prod.totalStock }} pcs
              </td>
              <td class="py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold inline-block"
                  :class="{
                    'bg-emerald-100 text-emerald-800': prod.status === 'published',
                    'bg-neutral-200 text-neutral-700': prod.status === 'draft',
                    'bg-rose-100 text-rose-800': prod.status === 'archived'
                  }"
                >
                  {{ prod.status === 'published' ? 'Tayang' : prod.status === 'draft' ? 'Draf' : 'Arsip' }}
                </span>
              </td>
              <td class="py-4 text-right">
                <div class="flex items-center justify-end gap-2">
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
