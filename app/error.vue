<script setup lang="ts">
import { Home, ArrowLeft, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-6 text-center">
    <div class="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-xl space-y-6">
      <div class="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-800">
        <span class="text-2xl font-black">{{ error?.statusCode || 404 }}</span>
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-black text-neutral-900">
          {{ error?.statusCode === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kendala Sistem' }}
        </h1>
        <p class="text-sm text-neutral-500 leading-relaxed">
          {{ error?.message || 'Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.' }}
        </p>
      </div>

      <div class="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          @click="handleError"
          class="w-full py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home class="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  </div>
</template>
