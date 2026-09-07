<script setup lang="ts">
import { ref } from 'vue'
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
  Store
} from 'lucide-vue-next'
import { useAdminAuth } from '~/composables/useAdminAuth'

const { admin, logout, adminBase } = useAdminAuth()
const isMobileSidebarOpen = ref(false)

const navLinks = [
  { name: 'Dashboard', path: `${adminBase}/dashboard`, icon: LayoutDashboard },
  { name: 'Produk', path: `${adminBase}/products`, icon: Package },
  { name: 'Kategori', path: `${adminBase}/categories`, icon: FolderTree },
  { name: 'Pengaturan', path: `${adminBase}/settings`, icon: Settings },
]
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

      <NuxtLink
        to="/"
        target="_blank"
        class="text-xs text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 px-2.5 py-1.5 rounded-lg"
      >
        <Store class="w-3.5 h-3.5" />
        <span>Lihat Toko</span>
      </NuxtLink>
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
                <span class="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <ShieldCheck class="w-3 h-3 text-emerald-400 inline" /> Terproteksi
                </span>
              </div>
            </div>
            <button
              @click="isMobileSidebarOpen = false"
              class="lg:hidden text-neutral-400 hover:text-white"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="p-4 space-y-1.5">
            <NuxtLink
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileSidebarOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition group"
              active-class="bg-emerald-600 text-white shadow-sm"
              :class="$route.path.startsWith(item.path) && item.path !== `${adminBase}/dashboard` ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
            >
              <component :is="item.icon" class="w-4 h-4 shrink-0 transition group-hover:scale-110" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-neutral-800 space-y-3">
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
