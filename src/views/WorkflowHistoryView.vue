<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <GitBranch class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Workflow Execution History
        </h1>
      </div>
      <button 
        @click="router.push('/workflows')"
        class="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Back
      </button>
    </div>
    <WorkflowHistoryComponent v-if="execution" :execution="execution" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import WorkflowHistoryComponent from '../components/WorkflowHistoryComponent.vue'
import { GitBranch } from 'lucide-vue-next'
import type { WorkflowExecution } from '../types/appTypes'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const execution = computed(() => {
  if (route.query.executionId) {
    return store.activeProject?.workflows
      .flatMap((w) => w.executions || [])
      .find((e: WorkflowExecution) => e.id === route.query.executionId) || store.workflowHistory
  }
  return store.workflowHistory
})
</script>