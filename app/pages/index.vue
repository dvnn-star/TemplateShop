<script setup lang="ts">
import { ArrowRight, Sparkles, ShieldCheck, Truck, Headphones, ShoppingBag } from 'lucide-vue-next'
import { useStoreSettings } from '~/composables/useStoreSettings'

const { data: settings } = useStoreSettings()

// Fetch categories
const { data: categories } = await useFetch('/api/categories')

// Fetch featured/latest products
const { data: productsData } = await useFetch('/api/products?limit=8&sort=newest')

useHead({
  title: `${settings.value?.store_name || 'ModaStore'} - Koleksi Fashion & Apparel Terbaik`,
  meta: [
    {
      name: 'description',
      content: 'Temukan koleksi pakaian berkualitas tinggi, nyaman dipakai, dengan harga terbaik. Pesan langsung dengan mudah via WhatsApp.'
    },
    {
      property: 'og:title',
      content: `${settings.value?.store_name || 'ModaStore'} - Belanja Fashion Online Mudah & Cepat`
    },
    {
      property: 'og:description',
      content: 'Pilihan baju, kemeja, celana, jaket berkualitas dengan pemesanan cepat tanpa ribet via WhatsApp.'
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Banner Section -->
    <section class="relative bg-neutral-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm">
              <Sparkles class="w-4 h-4 text-amber-400" />
              <span>Koleksi Terbaru 2026 Telah Tiba</span>
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Tampil Percaya Diri Dengan Busana Terbaik.
            </h1>
            
            <p class="text-neutral-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Material pilihan dengan potongan presisi untuk kenyamanan aktivitas sehari-hari. Pesan sekarang langsung terhubung dengan WhatsApp admin.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <NuxtLink
                to="/shop"
                class="w-full sm:w-auto px-8 py-4 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-bold text-base shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Lihat Semua Produk</span>
                <ArrowRight class="w-5 h-5" />
              </NuxtLink>

              <NuxtLink
                to="/search"
                class="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-base transition flex items-center justify-center gap-2"
              >
                <span>Cari Produk</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Hero Featured Visual -->
          <div class="relative hidden lg:block">
            <div class="relative mx-auto max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <img
                src="/images/products/kaos-oversize-heavy-cotton-1.jpg"
                alt="ModaStore Showcase - Kaos Oversize Heavy Cotton"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <span class="text-xs uppercase tracking-widest text-neutral-300 font-semibold">Best Seller</span>
                <h3 class="text-2xl font-bold text-white mt-1">Kaos Oversize Heavy Cotton</h3>
                <p class="text-emerald-400 font-bold text-lg mt-1">Rp 129.000</p>
                <NuxtLink
                  to="/product/kaos-oversize-heavy-cotton"
                  class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline hover:text-emerald-300"
                >
                  Lihat Detail Produk &rarr;
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">Pilihan Kategori</span>
          <h2 class="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">Jelajahi Berdasarkan Kategori</h2>
        </div>
        <NuxtLink to="/shop" class="text-sm font-bold text-neutral-900 hover:underline inline-flex items-center gap-1">
          <span>Semua Kategori</span>
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/shop/${cat.slug}`"
          class="group p-5 bg-white rounded-2xl border border-neutral-200 hover:border-neutral-900 hover:shadow-lg transition-all duration-200 text-center flex flex-col items-center justify-center"
        >
          <div class="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-3">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <span class="font-bold text-sm text-neutral-900 group-hover:text-neutral-950">{{ cat.name }}</span>
          <span class="text-xs text-neutral-400 mt-1">{{ cat.productCount || 0 }} produk</span>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="bg-neutral-100/70 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">Rekomendasi Kami</span>
            <h2 class="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">Produk Pilihan Terbaru</h2>
          </div>
          <NuxtLink to="/shop" class="text-sm font-bold text-neutral-900 hover:underline inline-flex items-center gap-1">
            <span>Buka Katalog Lengkap</span>
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div v-if="productsData?.products?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <ProductCard
            v-for="prod in productsData.products"
            :key="prod.id"
            :product="prod"
          />
        </div>
        <div v-else class="text-center py-12 text-neutral-500">
          Belum ada produk yang dipublikasikan.
        </div>
      </div>
    </section>

    <!-- Banner CTA to WhatsApp -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="space-y-3 text-center md:text-left max-w-xl">
          <span class="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Layanan Pelanggan Ramah</span>
          <h3 class="text-2xl sm:text-3xl font-black">Punya Pertanyaan atau Ingin Konsultasi Ukuran?</h3>
          <p class="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Admin kami siap membantu mengecek ketersediaan stok, rekomendasi size, dan pengiriman tercepat via WhatsApp.
          </p>
        </div>
        <a
          v-if="settings?.whatsapp_number"
          :href="`https://wa.me/${settings.whatsapp_number}?text=Halo%20Admin%20saya%20ingin%20tanya%20seputar%20produk`"
          target="_blank"
          rel="noopener noreferrer"
          class="px-8 py-4 bg-white text-emerald-800 hover:bg-neutral-100 rounded-xl font-bold text-base shadow-md transition shrink-0 inline-flex items-center gap-2"
        >
          <span>Chat WhatsApp Sekarang</span>
          <ArrowRight class="w-5 h-5" />
        </a>
      </div>
    </section>
  </div>
</template>
