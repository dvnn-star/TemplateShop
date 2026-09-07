export interface CartItem {
  key: string // unique: productId-variantId
  productId: number
  variantId: number
  productName: string
  productSlug: string
  imageUrl: string
  color: string
  size: string
  price: number
  quantity: number
  maxStock: number
}

export const useCart = () => {
  const items = useState<CartItem[]>('cart_items', () => [])
  const isInitialized = useState<boolean>('cart_initialized', () => false)

  // Sync with localStorage on client
  if (import.meta.client && !isInitialized.value) {
    try {
      const saved = localStorage.getItem('modastore_cart')
      if (saved) {
        items.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e)
    }
    isInitialized.value = true

    watch(
      items,
      (val) => {
        try {
          localStorage.setItem('modastore_cart', JSON.stringify(val))
        } catch (e) {
          console.error('Failed to save cart to storage', e)
        }
      },
      { deep: true }
    )
  }

  const addItem = (item: Omit<CartItem, 'key'>) => {
    const key = `${item.productId}-${item.variantId}`
    const existing = items.value.find((i) => i.key === key)

    if (existing) {
      const newQty = existing.quantity + item.quantity
      if (newQty > item.maxStock) {
        existing.quantity = item.maxStock
        return { success: false, message: `Stok terbatas! Maksimum hanya ${item.maxStock} item.` }
      }
      existing.quantity = newQty
      return { success: true, message: 'Jumlah produk dalam keranjang diperbarui.' }
    } else {
      if (item.quantity > item.maxStock) {
        return { success: false, message: `Stok tidak mencukupi. Tersisa ${item.maxStock}.` }
      }
      items.value.push({ ...item, key })
      return { success: true, message: 'Produk berhasil ditambahkan ke keranjang.' }
    }
  }

  const updateQuantity = (key: string, qty: number) => {
    const item = items.value.find((i) => i.key === key)
    if (!item) return

    if (qty <= 0) {
      removeItem(key)
    } else if (qty > item.maxStock) {
      item.quantity = item.maxStock
    } else {
      item.quantity = qty
    }
  }

  const removeItem = (key: string) => {
    items.value = items.value.filter((i) => i.key !== key)
  }

  const clearCart = () => {
    items.value = []
  }

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice
  }
}
