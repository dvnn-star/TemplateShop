<script setup lang="ts">
const route = useRoute()
const productId = route.params.id

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: product, error } = await useFetch(`/api/admin/products/${productId}`)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan', fatal: true })
}

const initialData = computed(() => {
  if (!product.value) return undefined
  return {
    id: product.value.id,
    name: product.value.name,
    slug: product.value.slug,
    description: product.value.description,
    price: product.value.price,
    categoryId: product.value.categoryId,
    status: product.value.status,
    images: product.value.images?.map((img: any) => img.imageUrl) || [],
    variants: product.value.variants || []
  }
})

useHead({
  title: `Edit ${product.value?.name || 'Produk'} - Admin Portal`
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
        Edit Produk: {{ product?.name }}
      </h1>
      <p class="text-neutral-500 text-sm mt-1">
        Perbarui informasi produk, ganti foto, kelola stok varian, atau ubah status tayang.
      </p>
    </div>

    <ProductForm
      v-if="initialData"
      :initial-data="initialData"
      :is-edit="true"
    />
  </div>
</template>
