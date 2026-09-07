<script setup lang="ts">
import { useStoreSettings } from '~/composables/useStoreSettings'
import { ShieldCheck, Truck, MessageCircle, HelpCircle } from 'lucide-vue-next'

const { data: settings } = useStoreSettings()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white border-t border-neutral-200 mt-20">
    <!-- Value highlights section -->
    <div class="border-b border-neutral-100 py-10 bg-neutral-50/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex items-start gap-4">
          <div class="p-3 bg-neutral-900 text-white rounded-xl">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-neutral-900 text-sm">100% Produk Original</h4>
            <p class="text-neutral-500 text-xs mt-1 leading-relaxed">
              Semua produk dijamin kualitas dan material terbaik langsung dari produsen resmi.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-3 bg-neutral-900 text-white rounded-xl">
            <MessageCircle class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-neutral-900 text-sm">Pesan Praktis via WhatsApp</h4>
            <p class="text-neutral-500 text-xs mt-1 leading-relaxed">
              Order mudah tanpa ribet registrasi akun. CS responsif siap membantu proses belanja.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="p-3 bg-neutral-900 text-white rounded-xl">
            <Truck class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-neutral-900 text-sm">Pengiriman ke Seluruh Indonesia</h4>
            <p class="text-neutral-500 text-xs mt-1 leading-relaxed">
              Bekerja sama dengan berbagai ekspedisi terpercaya untuk menjamin paket sampai dengan selamat.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Footer Links -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand column -->
        <div class="space-y-4 md:col-span-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
              M
            </div>
            <span class="font-black text-xl text-neutral-900">{{ settings?.store_name || 'ModaStore' }}</span>
          </div>
          <p class="text-neutral-600 text-sm max-w-sm leading-relaxed">
            {{ settings?.store_description || 'Platform belanja fashion & apparel pilihan dengan sistem checkout cepat WhatsApp.' }}
          </p>
          <div class="pt-2">
            <a
              v-if="settings?.whatsapp_number"
              :href="`https://wa.me/${settings.whatsapp_number}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <MessageCircle class="w-4 h-4" />
              <span>Hubungi CS WhatsApp</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-bold text-neutral-900 text-sm mb-4">Navigasi</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li><NuxtLink to="/" class="hover:text-neutral-900 transition">Beranda</NuxtLink></li>
            <li><NuxtLink to="/shop" class="hover:text-neutral-900 transition">Katalog Produk</NuxtLink></li>
            <li><NuxtLink to="/cart" class="hover:text-neutral-900 transition">Keranjang Belanja</NuxtLink></li>
            <li><NuxtLink to="/search" class="hover:text-neutral-900 transition">Pencarian</NuxtLink></li>
          </ul>
        </div>

        <!-- Customer Care -->
        <div>
          <h4 class="font-bold text-neutral-900 text-sm mb-4">Bantuan & Informasi</h4>
          <ul class="space-y-2 text-sm text-neutral-600">
            <li><span>Jam Operasional: 08.00 - 21.00 WIB</span></li>
            <li><span>Pengiriman: JNE, J&T, SiCepat</span></li>
            <li><span>Pembayaran: Transfer Bank, QRIS</span></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-neutral-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <p>&copy; {{ currentYear }} {{ settings?.store_name || 'ModaStore' }}. All rights reserved.</p>
        <p class="text-[11px] text-neutral-400">Dibuat dengan Nuxt 4 & SQLite</p>
      </div>
    </div>
  </footer>
</template>
