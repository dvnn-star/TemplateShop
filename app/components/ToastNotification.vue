<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium transition-all"
        :class="{
          'bg-emerald-50 border-emerald-200 text-emerald-900': toast.type === 'success',
          'bg-rose-50 border-rose-200 text-rose-900': toast.type === 'error',
          'bg-sky-50 border-sky-200 text-sky-900': toast.type === 'info',
        }"
      >
        <div class="flex items-center gap-3">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600 shrink-0" />
          <Info v-else class="w-5 h-5 text-sky-600 shrink-0" />
          <span>{{ toast.message }}</span>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="ml-3 p-1 rounded-lg hover:bg-black/5 transition shrink-0"
          aria-label="Tutup"
        >
          <X class="w-4 h-4 opacity-70" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
