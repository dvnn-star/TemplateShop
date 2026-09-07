<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  ArrowLeft,
  ShieldAlert,
  User,
  MapPin,
  FileText
} from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { formatRupiah } from '~/composables/useCurrency'
import { useToast } from '~/composables/useToast'
import { useStoreSettings } from '~/composables/useStoreSettings'

const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart()
const { showToast } = useToast()
const { data: settings } = useStoreSettings()

// Customer Order Info Form
const customerName = ref('')
const customerPhone = ref('')
const customerAddress = ref('')
const customerNotes = ref('')
const isSubmitting = ref(false)

const handleCheckoutWhatsApp = () => {
  if (items.value.length === 0) {
    showToast('Keranjang Anda masih kosong.', 'error')
    return
  }

  if (!customerName.value.trim()) {
    showToast('Harap isi Nama Penerima sebelum checkout.', 'error')
    return
  }

  isSubmitting.value = true

  const phone = settings.value?.whatsapp_number || '6281234567890'
  const storeName = settings.value?.store_name || 'ModaStore'

  // Format order items list
  const itemsText = items.value.map((item, index) => {
    const itemSubtotal = item.price * item.quantity
    return `${index + 1}. *${item.productName}*\n   • Varian: ${item.color} | Size ${item.size}\n   • Jumlah: ${item.quantity} pcs\n   • Subtotal: ${formatRupiah(itemSubtotal)}`
  }).join('\n\n')

  const messageLines = [
    `Halo Admin *${storeName}*, saya ingin melakukan pemesanan via WhatsApp:`,
    '',
    `*📋 DAFTAR PESANAN:*`,
    itemsText,
    '',
    `----------------------------------------`,
    `*Total Item:* ${totalItems.value} pcs`,
    `*Total Tagihan:* *${formatRupiah(totalPrice.value)}*`,
    `----------------------------------------`,
    '',
    `*👤 DATA PENGIRIMAN:*`,
    `• Nama Penerima: ${customerName.value.trim()}`,
    customerPhone.value.trim() ? `• No. Kontak: ${customerPhone.value.trim()}` : null,
    customerAddress.value.trim() ? `• Alamat Lengkap: ${customerAddress.value.trim()}` : null,
    customerNotes.value.trim() ? `• Catatan Khusus: ${customerNotes.value.trim()}` : null,
    '',
    `Mohon info ketersediaan stok & nomor rekening pembayaran ya min. Terima kasih!`
  ].filter(line => line !== null).join('\n')

  const encodedUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageLines)}`

  // Open WhatsApp in a new window/tab
  window.open(encodedUrl, '_blank')
  showToast('Membuka WhatsApp untuk konfirmasi pesanan...', 'success')
  isSubmitting.value = false
}

useHead({
  title: 'Keranjang Belanja - ModaStore',
  meta: [
    {
      name: 'description',
      content: 'Periksa produk pilihan Anda dalam keranjang dan selesaikan pesanan dengan cepat melalui WhatsApp.'
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
        <ShoppingBag class="w-8 h-8" />
        <span>Keranjang Belanja</span>
      </h1>
      <p class="text-neutral-500 text-sm mt-1">
        Periksa barang pilihan Anda dan lengkapi data untuk memesan via WhatsApp.
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="items.length === 0"
      class="text-center py-24 bg-white rounded-3xl border border-neutral-200 p-8 max-w-xl mx-auto shadow-sm"
    >
      <div class="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
        <ShoppingBag class="w-10 h-10 stroke-1" />
      </div>
      <h2 class="text-2xl font-bold text-neutral-900">Keranjang Belanja Kosong</h2>
      <p class="text-neutral-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
        Anda belum menambahkan barang apapun. Jelajahi katalog kami dan temukan busana favorit Anda.
      </p>
      <div class="mt-8">
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow-md transition"
        >
          <span>Mulai Belanja Sekarang</span>
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Cart Layout (Items List + Checkout Summary) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Items List Column (2 Columns on large screens) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-200">
          <span class="text-sm font-semibold text-neutral-700">Daftar Item ({{ totalItems }} barang)</span>
          <button
            @click="clearCart"
            class="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Kosongkan Keranjang</span>
          </button>
        </div>

        <div
          v-for="item in items"
          :key="item.key"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200 gap-4 transition hover:border-neutral-300 shadow-sm"
        >
          <!-- Product image and details -->
          <div class="flex items-center gap-4">
            <img
              :src="item.imageUrl"
              :alt="item.productName"
              class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
            />
            <div class="space-y-1">
              <NuxtLink
                :to="`/product/${item.productSlug}`"
                class="font-bold text-neutral-900 hover:underline text-sm sm:text-base line-clamp-1"
              >
                {{ item.productName }}
              </NuxtLink>
              
              <div class="text-xs text-neutral-500 flex flex-wrap items-center gap-2">
                <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                  Warna: {{ item.color }}
                </span>
                <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-medium">
                  Size: {{ item.size }}
                </span>
              </div>

              <div class="text-sm font-bold text-neutral-900 pt-1">
                {{ formatRupiah(item.price) }}
              </div>
            </div>
          </div>

          <!-- Quantity Controls & Actions -->
          <div class="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
            <!-- Counter -->
            <div class="flex items-center border border-neutral-300 rounded-xl bg-neutral-50 p-1">
              <button
                @click="updateQuantity(item.key, item.quantity - 1)"
                class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-neutral-600 transition"
                aria-label="Kurangi jumlah"
              >
                <Minus class="w-3.5 h-3.5" />
              </button>
              <span class="w-10 text-center text-xs font-bold text-neutral-900">
                {{ item.quantity }}
              </span>
              <button
                @click="updateQuantity(item.key, item.quantity + 1)"
                :disabled="item.quantity >= item.maxStock"
                class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white text-neutral-600 disabled:opacity-30 transition"
                aria-label="Tambah jumlah"
              >
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Subtotal -->
            <div class="text-right min-w-[100px]">
              <span class="text-xs text-neutral-400 block sm:hidden">Total</span>
              <span class="font-bold text-sm sm:text-base text-neutral-900">
                {{ formatRupiah(item.price * item.quantity) }}
              </span>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeItem(item.key)"
              class="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              aria-label="Hapus produk"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="pt-4">
          <NuxtLink
            to="/shop"
            class="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Lanjut Belanja Produk Lain</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Checkout Form & Order Summary Column -->
      <div class="space-y-6">
        <!-- Customer Info Card -->
        <div class="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <h3 class="font-bold text-neutral-900 text-base flex items-center gap-2 pb-2 border-b border-neutral-100">
            <User class="w-4 h-4" />
            <span>Informasi Pembeli</span>
          </h3>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Nama Lengkap Penerima <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="customerName"
              type="text"
              placeholder="cth: Budi Santoso"
              class="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              v-model="customerPhone"
              type="tel"
              placeholder="cth: 08123456789"
              class="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Alamat Pengiriman (Kecamatan, Kota, Provinsi)
            </label>
            <textarea
              v-model="customerAddress"
              rows="2"
              placeholder="cth: Jl. Melati No. 45, RT 02/RW 04, Tebet, Jakarta Selatan"
              class="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
              Catatan Pesanan (Opsional)
            </label>
            <input
              v-model="customerNotes"
              type="text"
              placeholder="cth: Mohon konfirmasi sebelum kirim"
              class="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <!-- Summary & WhatsApp Button Card -->
        <div class="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
          <h3 class="font-bold text-neutral-900 text-base pb-2 border-b border-neutral-100">
            Ringkasan Pesanan
          </h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-neutral-600">
              <span>Total Kuantitas</span>
              <span class="font-medium text-neutral-900">{{ totalItems }} pcs</span>
            </div>
            <div class="flex justify-between text-neutral-600">
              <span>Subtotal Produk</span>
              <span class="font-medium text-neutral-900">{{ formatRupiah(totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-neutral-500 text-xs italic">
              <span>Ongkos Kirim</span>
              <span>Dihitung di WhatsApp</span>
            </div>
            <div class="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
              <span class="font-bold text-base text-neutral-900">Total Belanja</span>
              <span class="font-black text-xl text-neutral-950">{{ formatRupiah(totalPrice) }}</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button
            @click="handleCheckoutWhatsApp"
            :disabled="isSubmitting"
            class="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white rounded-2xl font-bold text-base shadow-lg transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <MessageCircle class="w-5 h-5 shrink-0" />
            <span>Checkout via WhatsApp</span>
          </button>

          <p class="text-[11px] text-neutral-400 text-center leading-relaxed">
            Pesanan Anda akan langsung diformat secara otomatis dan dikirimkan ke WhatsApp resmi toko kami untuk proses verifikasi.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
