<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const categorySlug = computed(() => route.params.category as string)

// Fetch all categories to get category info
const { data: categories } = await useFetch('/api/categories')
const currentCategory = computed(() =>
  categories.value?.find((c) => c.slug === categorySlug.value)
)

// Fetch products for this category
const { data: productsData, status } = await useFetch('/api/products', {
  query: computed(() => ({
    category: categorySlug.value,
    limit: '24',
    sort: 'newest'
  }))
})

useHead({
  title: computed(() => `${currentCategory.value?.name || 'Kategori'} - ModaStore`),
  meta: [
    {
      name: 'description',
      content: computed(() => `Koleksi produk ${currentCategory.value?.name || ''} pilihan dengan kualitas terjamin.`)
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Breadcrumb & Back -->
    <div class="mb-6">
      <NuxtLink
        to="/shop"
        class="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Kembali ke Semua Produk</span>
      </NuxtLink>
    </div>

    <!-- Category Header -->
    <div class="bg-neutral-900 text-white p-8 sm:p-10 rounded-3xl mb-10 relative overflow-hidden">
      <div class="relative z-10 max-w-2xl">
        <span class="text-xs uppercase tracking-widest text-neutral-400 font-bold">Koleksi Kategori</span>
        <h1 class="text-3xl sm:text-4xl font-black mt-2">
          {{ currentCategory?.name || 'Kategori Produk' }}
        </h1>
        <p class="text-neutral-300 text-sm sm:text-base mt-2">
          Temukan ragam pilihan terbaik pada kategori {{ currentCategory?.name?.toLowerCase() || '' }}. Pesan mudah langsung via WhatsApp.
        </p>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="status === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
      <div v-for="i in 4" :key="i" class="bg-neutral-200 aspect-square rounded-2xl"></div>
    </div>

    <div v-else-if="productsData?.products?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      <ProductCard
        v-for="prod in productsData.products"
        :key="prod.id"
        :product="prod"
      />
    </div>

    <div v-else class="text-center py-20 bg-white rounded-2xl border border-neutral-200">
      <p class="text-neutral-500 font-medium">Belum ada produk dalam kategori ini.</p>
      <NuxtLink
        to="/shop"
        class="mt-4 inline-block px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold"
      >
        Lihat Semua Produk
      </NuxtLink>
    </div>
  </div>
</template>
