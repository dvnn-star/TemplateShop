<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, Store, Phone, Lock, CheckCircle2, Shield } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { showToast } = useToast()

const storeName = ref('')
const whatsappNumber = ref('')
const storeDescription = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isSaving = ref(false)

// Fetch initial settings
const { data, refresh } = await useFetch('/api/admin/settings')

if (data.value) {
  storeName.value = data.value.settings.store_name || ''
  whatsappNumber.value = data.value.settings.whatsapp_number || ''
  storeDescription.value = data.value.settings.store_description || ''
}

const handleSaveSettings = async () => {
  if (newPassword.value) {
    if (newPassword.value !== confirmPassword.value) {
      showToast('Konfirmasi password baru tidak cocok.', 'error')
      return
    }
    if (!currentPassword.value) {
      showToast('Masukkan password saat ini untuk verifikasi penggantian password.', 'error')
      return
    }
  }

  isSaving.value = true
  try {
    const payload: any = {
      store_name: storeName.value,
      whatsapp_number: whatsappNumber.value,
      store_description: storeDescription.value,
    }

    if (newPassword.value) {
      payload.currentPassword = currentPassword.value
      payload.newPassword = newPassword.value
    }

    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: payload
    })

    showToast('Pengaturan toko berhasil disimpan!', 'success')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    refresh()
  } catch (err: any) {
    showToast(err.data?.message || err.message || 'Gagal menyimpan pengaturan', 'error')
  } finally {
    isSaving.value = false
  }
}

useHead({
  title: 'Pengaturan Toko - Admin Portal'
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="pb-6 border-b border-neutral-200">
      <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Pengaturan Toko & Akun</h1>
      <p class="text-neutral-500 text-sm mt-1">
        Kelola identitas toko, nomor tujuan pesanan WhatsApp, dan keamanan akun administrator.
      </p>
    </div>

    <form @submit.prevent="handleSaveSettings" class="space-y-8">
      <!-- Store Identity Settings -->
      <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h3 class="font-bold text-neutral-900 text-lg flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Store class="w-5 h-5 text-neutral-600" />
          <span>Informasi Toko</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Nama Toko / Brand <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="storeName"
              type="text"
              required
              class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="cth: ModaStore Indonesia"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Nomor WhatsApp Penerima Pesanan <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="whatsappNumber"
                type="text"
                required
                class="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="6281234567890 (Gunakan format 62)"
              />
              <Phone class="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>
            <p class="text-[11px] text-neutral-400 mt-1">Gunakan format internasional tanpa tanda + atau 0 di depan (contoh: 6281234567890)</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
            Deskripsi Singkat Toko
          </label>
          <textarea
            v-model="storeDescription"
            rows="3"
            class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="Deskripsi singkat yang tampil pada footer dan meta SEO website."
          ></textarea>
        </div>
      </div>

      <!-- Security / Admin Password -->
      <div class="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <h3 class="font-bold text-neutral-900 text-lg flex items-center gap-2 pb-3 border-b border-neutral-100">
          <Shield class="w-5 h-5 text-neutral-600" />
          <span>Keamanan Akun Admin</span>
        </h3>

        <div class="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs text-neutral-600">
          <p>
            Akun admin yang sedang aktif: <b>{{ data?.admin?.email }}</b>. Kosongkan isian di bawah ini bila tidak ingin mengganti password.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Password Saat Ini
            </label>
            <input
              v-model="currentPassword"
              type="password"
              class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Password Baru
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Konfirmasi Password Baru
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isSaving"
          class="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
