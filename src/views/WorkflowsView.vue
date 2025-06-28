<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
          <GitFork class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Workflow Management
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="router.push('/')"
          class="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Back
        </button>
        <button 
          @click="store.createWorkflow"
          class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold hover:from-green-700 hover:to-emerald-700"
        >
          <Plus class="w-5 h-5" /> New Workflow
        </button>
      </div>
    </div>
    
    <!-- Workflows List -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Workflows</h2>
      <div v-if="store.activeProject && store.activeProject.workflows.length === 0" class="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
          <ListTree class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No workflows created yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Create your first workflow to chain prompts with conditional logic and automate complex tasks.
        </p>
        <button 
          @click="store.createWorkflow"
          class="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold hover:from-green-700 hover:to-emerald-700"
        >
          Create First Workflow
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div 
          v-for="workflow in store.activeProject?.workflows"
          :key="workflow.id" 
          class="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
        >
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ workflow.name }}</h3>
              <div class="flex gap-2">
                <button 
                  @click="editWorkflow(workflow)"
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                  title="Edit"
                >
                  <Settings class="w-5 h-5" />
                </button>
                <button 
                  @click="runWorkflow(workflow)"
                  class="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                  title="Run"
                >
                  <Play class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                {{ workflow.steps.length }} steps
              </span>
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                {{ workflow.executions?.length || 0 }} execution{{ (workflow.executions?.length || 0) === 1 ? '' : 's' }}
              </span>
            </div>
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl">
              <div class="text-xs text-gray-600 dark:text-gray-300 font-medium max-h-20 overflow-auto">
                {{ workflow.steps.map(s => s.name).join(' → ') }}
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
            Created {{ workflow.createdAt ? formatDate(workflow.createdAt) : 'Unknown' }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Executions -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Executions</h2>
      <div v-if="recentExecutions.length === 0" class="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center">
          <History class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No executions yet</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Run a workflow to see execution history here.
        </p>
      </div>
      <div v-else class="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Workflow</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="{ workflow, execution } in recentExecutions" :key="execution.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ workflow.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    execution.steps.every(s => s.success)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]">
                    {{ execution.steps.every(s => s.success) ? 'Success' : 'Failed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                        :style="{ width: `${(execution.steps.length / workflow.steps.length) * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ execution.steps.length }} / {{ workflow.steps.length }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(execution.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    @click="viewExecutionDetails(execution)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { formatDate } from '../utils/exportUtils'
import { GitFork, Plus, Settings, Play, History, ListTree } from 'lucide-vue-next'
import type { Workflow, WorkflowExecution } from '../types/appTypes'

const router = useRouter()
const store = useAppStore()

const recentExecutions = computed(() => {
  if (!store.activeProject) return []
  
  return store.activeProject.workflows
    .flatMap((workflow: Workflow) => 
      (workflow.executions || []).map((execution: WorkflowExecution) => ({ workflow, execution }))
    )
    .sort((a, b) => 
      b.execution.createdAt.getTime() - a.execution.createdAt.getTime()
    )
})

const editWorkflow = (workflow: Workflow) => {
  store.activeWorkflow = workflow
  router.push({
    name: 'workflow-builder',
    query: { workflowId: workflow.id }
  })
}

const runWorkflow=(workflow: Workflow) => {
    store.runWorkflow(workflow)
    router.push({
        name: 'workflow-runner',
        query: { workflowId: workflow.id }
      })

}

const viewExecutionDetails = (execution: WorkflowExecution) => {
  store.workflowHistory = execution
  router.push({
    name: 'workflow-history',
    query: { executionId: execution.id }
  })
}
</script>