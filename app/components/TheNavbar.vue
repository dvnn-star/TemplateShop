<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingBag, Search, Menu, X, ChevronRight, Phone } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useStoreSettings } from '~/composables/useStoreSettings'

const { totalItems } = useCart()
const { data: settings } = useStoreSettings()

const isMobileMenuOpen = ref(false)
const searchQuery = ref('')
const router = useRouter()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
    isMobileMenuOpen.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
    <!-- Top announcement bar -->
    <div class="bg-neutral-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
      <span>🎉 Promo Eksklusif! Pesan langsung via WhatsApp & Dapatkan Pelayanan Cepat</span>
      <a 
        v-if="settings?.whatsapp_number"
        :href="`https://wa.me/${settings.whatsapp_number}`" 
        target="_blank" 
        rel="noopener noreferrer"
        class="underline font-semibold hover:text-emerald-400 inline-flex items-center gap-1"
      >
        <Phone class="w-3 h-3 inline" /> Chat Admin
      </a>
    </div>

    <!-- Main Navigation Bar -->
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
      <!-- Mobile menu button -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
        aria-label="Toggle menu"
      >
        <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>

      <!-- Brand Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-black tracking-tight text-neutral-900 group">
        <div class="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
          <span class="font-black text-lg">M</span>
        </div>
        <div class="flex flex-col">
          <span class="leading-none text-lg font-bold">{{ settings?.store_name || 'ModaStore' }}</span>
          <span class="text-[10px] text-neutral-500 font-normal uppercase tracking-wider">Official Store</span>
        </div>
      </NuxtLink>

      <!-- Desktop Nav Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
        <NuxtLink to="/" class="hover:text-neutral-950 transition" active-class="text-neutral-950 font-bold">
          Beranda
        </NuxtLink>
        <NuxtLink to="/shop" class="hover:text-neutral-950 transition" active-class="text-neutral-950 font-bold">
          Semua Produk
        </NuxtLink>
        <NuxtLink to="/search" class="hover:text-neutral-950 transition" active-class="text-neutral-950 font-bold">
          Cari Produk
        </NuxtLink>
      </div>

      <!-- Search & Cart Actions -->
      <div class="flex items-center gap-3">
        <!-- Quick search input (desktop) -->
        <form @submit.prevent="handleSearch" class="hidden sm:flex relative items-center">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari baju, kemeja, celana..."
            class="pl-9 pr-4 py-2 text-sm bg-neutral-100 rounded-full w-48 lg:w-64 border border-transparent focus:border-neutral-400 focus:bg-white focus:outline-none transition"
          />
          <Search class="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
        </form>

        <!-- Cart Icon Button -->
        <NuxtLink
          to="/cart"
          class="relative p-2.5 rounded-full text-neutral-800 hover:bg-neutral-100 transition flex items-center justify-center"
          aria-label="Keranjang Belanja"
        >
          <ShoppingBag class="w-5 h-5" />
          <span
            v-if="totalItems > 0"
            class="absolute -top-1 -right-1 bg-neutral-900 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-pulse"
          >
            {{ totalItems }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Mobile Drawer Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden border-t border-neutral-200 bg-white px-4 py-5 space-y-4 animate-in slide-in-from-top duration-200"
    >
      <form @submit.prevent="handleSearch" class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari produk impianmu..."
          class="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-100 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <Search class="w-5 h-5 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
      </form>

      <div class="flex flex-col gap-2 pt-2 text-base font-medium text-neutral-700">
        <NuxtLink
          to="/"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg hover:bg-neutral-100 flex items-center justify-between"
        >
          <span>Beranda</span>
          <ChevronRight class="w-4 h-4 text-neutral-400" />
        </NuxtLink>
        <NuxtLink
          to="/shop"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg hover:bg-neutral-100 flex items-center justify-between"
        >
          <span>Katalog Produk</span>
          <ChevronRight class="w-4 h-4 text-neutral-400" />
        </NuxtLink>
        <NuxtLink
          to="/cart"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg hover:bg-neutral-100 flex items-center justify-between"
        >
          <span>Keranjang Belanja ({{ totalItems }})</span>
          <ChevronRight class="w-4 h-4 text-neutral-400" />
        </NuxtLink>
        <NuxtLink
          to="/search"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg hover:bg-neutral-100 flex items-center justify-between"
        >
          <span>Pencarian Lengkap</span>
          <ChevronRight class="w-4 h-4 text-neutral-400" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
