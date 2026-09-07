<script setup lang="ts">
import { formatRupiah } from '~/composables/useCurrency'
import { ArrowRight, ImageOff } from 'lucide-vue-next'

interface ProductProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    categoryName?: string
    categorySlug?: string
    primaryImage?: string
    totalStock?: number
    variantCount?: number
  }
}

const props = defineProps<ProductProps>()
</script>

<template>
  <NuxtLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300"
  >
    <!-- Product Thumbnail Container -->
    <div class="relative w-full aspect-square bg-neutral-100 overflow-hidden">
      <img
        v-if="product.primaryImage"
        :src="product.primaryImage"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-neutral-400">
        <ImageOff class="w-10 h-10 stroke-1" />
      </div>

      <!-- Category badge -->
      <span
        v-if="product.categoryName"
        class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm"
      >
        {{ product.categoryName }}
      </span>

      <!-- Stock status badge -->
      <div class="absolute top-3 right-3">
        <span
          v-if="product.totalStock === 0"
          class="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow"
        >
          Habis
        </span>
        <span
          v-else-if="product.totalStock != null && product.totalStock <= 5"
          class="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow"
        >
          Sisa {{ product.totalStock }}
        </span>
      </div>
    </div>

    <!-- Product Info Details -->
    <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between">
      <div>
        <h3 class="font-semibold text-neutral-900 text-sm sm:text-base line-clamp-2 group-hover:text-neutral-700 transition">
          {{ product.name }}
        </h3>
        
        <p v-if="product.variantCount" class="text-xs text-neutral-400 mt-1">
          {{ product.variantCount }} pilihan varian
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <div>
          <span class="text-xs text-neutral-400 block font-medium">Harga</span>
          <span class="text-base sm:text-lg font-bold text-neutral-900">
            {{ formatRupiah(product.price) }}
          </span>
        </div>

        <div class="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition">
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
