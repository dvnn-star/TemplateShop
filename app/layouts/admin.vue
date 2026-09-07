<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Store,
  RefreshCw,
  AlertTriangle
} from 'lucide-vue-next'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useAdminRealtime } from '~/composables/useAdminRealtime'

const { admin, logout, adminBase } = useAdminAuth()
const { stats, lastUpdated, isSyncing, refreshStats } = useAdminRealtime()
const isMobileSidebarOpen = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshStats()
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshStats()
    }
  }, 4000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="min-h-screen bg-neutral-100 flex flex-col font-sans">
    <!-- Mobile Admin Top Bar -->
    <header class="lg:hidden bg-neutral-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-neutral-800">
      <div class="flex items-center gap-2">
        <button
          @click="isMobileSidebarOpen = !isMobileSidebarOpen"
          class="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800"
          aria-label="Toggle menu"
        >
          <Menu v-if="!isMobileSidebarOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2 font-bold text-sm">
          <div class="w-6 h-6 rounded bg-emerald-500 text-neutral-950 flex items-center justify-center text-xs font-black">
            A
          </div>
          <span>Admin Portal</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="refreshStats"
          :disabled="isSyncing"
          class="p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          title="Segarkan data sekarang"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncing }" />
        </button>
        <NuxtLink
          to="/"
          target="_blank"
          class="text-xs text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 px-2.5 py-1.5 rounded-lg"
        >
          <Store class="w-3.5 h-3.5" />
          <span>Toko</span>
        </NuxtLink>
      </div>
    </header>

    <div class="flex-grow flex">
      <!-- Desktop Sidebar -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div>
          <!-- Sidebar Brand Header -->
          <div class="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center font-black text-base shadow">
                A
              </div>
              <div>
                <h2 class="font-black text-base leading-tight tracking-wide text-white">Admin Panel</h2>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span class="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Live Real-Time</span>
                </div>
              </div>
            </div>
            <button
              @click="isMobileSidebarOpen = false"
              class="lg:hidden text-neutral-400 hover:text-white"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Navigation Links with Live Count Badges -->
          <nav class="p-4 space-y-1.5">
            <!-- Dashboard Link -->
            <NuxtLink
              :to="`${adminBase}/dashboard`"
              @click="isMobileSidebarOpen = false"
              class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition group"
              active-class="bg-emerald-600 text-white shadow-sm"
              :class="$route.path === `${adminBase}/dashboard` ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
            >
              <div class="flex items-center gap-3">
                <LayoutDashboard class="w-4 h-4 shrink-0 transition group-hover:scale-110" />
                <span>Dashboard</span>
              </div>
              <span
                v-if="stats.lowStockCount > 0"
                class="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center gap-1"
                title="Varian stok menipis"
              >
                <AlertTriangle class="w-2.5 h-2.5" />
                {{ stats.lowStockCount }}
              </span>
            </NuxtLink>

            <!-- Products Link with Real-time Count Badge -->
            <NuxtLink
              :to="`${adminBase}/products`"
              @click="isMobileSidebarOpen = false"
              class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition group"
              active-class="bg-emerald-600 text-white shadow-sm"
              :class="$route.path.startsWith(`${adminBase}/products`) ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
            >
              <div class="flex items-center gap-3">
                <Package class="w-4 h-4 shrink-0 transition group-hover:scale-110" />
                <span>Produk</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700">
                {{ stats.totalProducts }}
              </span>
            </NuxtLink>

            <!-- Categories Link with Real-time Count Badge -->
            <NuxtLink
              :to="`${adminBase}/categories`"
              @click="isMobileSidebarOpen = false"
              class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition group"
              active-class="bg-emerald-600 text-white shadow-sm"
              :class="$route.path.startsWith(`${adminBase}/categories`) ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
            >
              <div class="flex items-center gap-3">
                <FolderTree class="w-4 h-4 shrink-0 transition group-hover:scale-110" />
                <span>Kategori</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 text-neutral-300 group-hover:bg-neutral-700">
                {{ stats.totalCategories }}
              </span>
            </NuxtLink>

            <!-- Settings Link -->
            <NuxtLink
              :to="`${adminBase}/settings`"
              @click="isMobileSidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition group"
              active-class="bg-emerald-600 text-white shadow-sm"
              :class="$route.path.startsWith(`${adminBase}/settings`) ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
            >
              <Settings class="w-4 h-4 shrink-0 transition group-hover:scale-110" />
              <span>Pengaturan</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-neutral-800 space-y-3">
          <!-- Live sync status button -->
          <button
            @click="refreshStats"
            :disabled="isSyncing"
            class="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-[11px] font-medium bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 transition"
          >
            <span class="flex items-center gap-2">
              <RefreshCw class="w-3 h-3 text-emerald-400" :class="{ 'animate-spin': isSyncing }" />
              <span>{{ isSyncing ? 'Menyinkronkan...' : (lastUpdated ? `Sync: ${lastUpdated}` : 'Real-time aktif') }}</span>
            </span>
            <span class="text-[10px] text-neutral-500 uppercase font-mono">Auto</span>
          </button>

          <NuxtLink
            to="/"
            target="_blank"
            class="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <span class="flex items-center gap-2">
              <Store class="w-4 h-4" />
              <span>Lihat Toko Publik</span>
            </span>
            <ExternalLink class="w-3.5 h-3.5" />
          </NuxtLink>

          <div class="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
            <div class="truncate max-w-[140px]">
              <span class="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block">Masuk Sebagai</span>
              <span class="text-xs font-medium text-neutral-300 truncate block">{{ admin?.email || 'Admin' }}</span>
            </div>
            <button
              @click="logout"
              class="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay for mobile sidebar -->
      <div
        v-if="isMobileSidebarOpen"
        @click="isMobileSidebarOpen = false"
        class="fixed inset-0 bg-black/60 z-40 lg:hidden"
      ></div>

      <!-- Main Admin Content Area -->
      <main class="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full">
        <slot />
      </main>
    </div>
    <ToastNotification />
  </div>
</template>
