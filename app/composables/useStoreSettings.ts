export const useStoreSettings = () => {
  return useAsyncData('public-settings', () => $fetch('/api/settings'), {
    default: () => ({
      store_name: 'ModaStore',
      whatsapp_number: '6281234567890',
      store_description: 'Toko busana dan lifestyle terpercaya.',
      currency_symbol: 'Rp'
    })
  })
}
