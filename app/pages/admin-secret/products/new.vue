<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'Tambah Produk Baru - Admin Portal'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Tambah Produk Baru</h1>
      <p class="text-neutral-500 text-sm mt-1">
        Lengkapi formulir untuk menambahkan produk baru ke dalam katalog toko online.
      </p>
    </div>

    <ProductForm />
  </div>
</template>
