<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
      @click="exportConfig"
      :disabled="isExporting"
    >
      <svg
        v-if="!isExporting"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span v-if="isExporting">Exporting...</span>
      <span v-else>Export Config</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const isExporting = ref(false)

async function exportConfig() {
  isExporting.value = true
  try {
    const response = await fetch('/api/config/export')
    
    if (!response.ok) {
      throw new Error('Failed to export config')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mafl-config.yml'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export config. Please try again.')
  } finally {
    isExporting.value = false
  }
}
</script>
