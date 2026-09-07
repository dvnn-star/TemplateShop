<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-vue-next'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const { login, adminBase } = useAdminAuth()
const { showToast } = useToast()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Mohon isi email dan password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await login(email.value, password.value)
    showToast('Login berhasil! Mengalihkan ke dashboard...', 'success')
    router.push(`${adminBase}/dashboard`)
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Email atau password salah.'
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'Login Admin - ModaStore'
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white relative">
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

    <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative z-10">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-lg">
          A
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white">Login Admin Portal</h1>
        <p class="text-neutral-400 text-xs mt-1">
          Halaman khusus manajemen katalog, stok, dan pengaturan toko.
        </p>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs font-medium"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Email / Username Administrator
          </label>
          <div class="relative">
            <input
              v-model="email"
              type="text"
              required
              class="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="Masukkan email atau username"
            />
            <Mail class="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full pl-10 pr-11 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="••••••••"
            />
            <Lock class="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
              aria-label="Tampilkan password"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-6"
        >
          <span v-if="isLoading">Memproses...</span>
          <template v-else>
            <span>Masuk ke Dashboard</span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>
      </form>

      <!-- Back to storefront link -->
      <div class="mt-8 pt-6 border-t border-neutral-800/80 text-center">
        <NuxtLink
          to="/"
          class="text-xs text-neutral-400 hover:text-white transition inline-flex items-center gap-1.5 font-medium"
        >
          <span>&larr; Kembali ke Halaman Toko</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
