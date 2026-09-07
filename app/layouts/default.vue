<template>
  <div class="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
    <TheNavbar />
    <main class="flex-grow">
      <slot />
    </main>
    <TheFooter />
    <ToastNotification />
  </div>
</template>
