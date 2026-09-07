<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const queryText = ref((route.query.q as string) || '')

const { data: response, status } = await useFetch('/api/products', {
  query: computed(() => ({
    q: queryText.value,
    limit: 20
  })),
  watch: [queryText]
})

const handleSearch = () => {
  router.replace({
    path: '/search',
    query: queryText.value.trim() ? { q: queryText.value.trim() } : {}
  })
}

const clearSearch = () => {
  queryText.value = ''
  router.replace({ path: '/search' })
}

useHead({
  title: 'Pencarian Produk - ModaStore',
  meta: [
    {
      name: 'description',
      content: 'Cari baju, kemeja, celana, jaket, dan aksesoris fashion impian Anda di katalog ModaStore.'
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Search Bar Hero -->
    <div class="max-w-2xl mx-auto text-center mb-12">
      <h1 class="text-3xl font-black text-neutral-900 tracking-tight">Cari Produk</h1>
      <p class="text-neutral-500 text-sm mt-2">
        Temukan busana dan apparel favorit Anda dengan mengetik kata kunci di bawah ini.
      </p>

      <form @submit.prevent="handleSearch" class="mt-6 relative">
        <input
          v-model="queryText"
          type="text"
          placeholder="Cari kaos, kemeja flannel, chino, hoodie..."
          class="w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-neutral-300 rounded-2xl focus:border-neutral-900 focus:outline-none shadow-sm transition"
          autofocus
        />
        <Search class="w-5 h-5 text-neutral-400 absolute left-4 top-5 pointer-events-none" />
        <button
          v-if="queryText"
          @click="clearSearch"
          type="button"
          class="absolute right-4 top-5 text-neutral-400 hover:text-neutral-700"
        >
          <X class="w-5 h-5" />
        </button>
      </form>

      <!-- Popular keywords -->
      <div class="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-neutral-500">
        <span>Paling dicari:</span>
        <button
          v-for="kw in ['Kaos Oversize', 'Kemeja Flannel', 'Celana Chino', 'Hoodie', 'Topi']"
          :key="kw"
          @click="queryText = kw; handleSearch()"
          class="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 font-medium transition"
        >
          {{ kw }}
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-neutral-200 mb-8">
        <h2 class="font-bold text-neutral-900 text-lg">
          <span v-if="queryText">Hasil Pencarian untuk "{{ queryText }}"</span>
          <span v-else>Semua Produk</span>
        </h2>
        <span class="text-sm text-neutral-500">
          {{ response?.products?.length || 0 }} produk ditemukan
        </span>
      </div>

      <div v-if="status === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
        <div v-for="i in 8" :key="i" class="bg-neutral-200 aspect-square rounded-2xl"></div>
      </div>

      <div v-else-if="response?.products?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard
          v-for="prod in response.products"
          :key="prod.id"
          :product="prod"
        />
      </div>

      <!-- No Results State -->
      <div v-else class="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
        <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <Search class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-lg text-neutral-900">Tidak ada produk yang cocok</h3>
        <p class="text-neutral-500 text-sm mt-1 max-w-sm mx-auto">
          Coba gunakan kata kunci lain yang lebih umum seperti "kaos", "kemeja", atau "celana".
        </p>
      </div>
    </div>
  </div>
</template>
