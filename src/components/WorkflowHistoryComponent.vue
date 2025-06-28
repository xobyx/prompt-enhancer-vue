<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4">Execution Details</h3>
    
    <div class="mb-6">
      <div class="flex justify-between mb-2">
        <span class="text-gray-600 dark:text-gray-400">Execution ID:</span>
        <span class="font-mono">{{ execution.id }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600 dark:text-gray-400">Executed at:</span>
        <span>{{ formatDate(execution.createdAt) }}</span>
      </div>
    </div>
    
    <h4 class="font-semibold mb-3">Step Execution History</h4>
    <div class="space-y-4">
      <div 
        v-for="(step, index) in execution.steps"
        :key="index"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div class="flex justify-between items-center mb-2">
          <h5 class="font-medium">Step {{ index + 1 }}</h5>
          <span 
            :class="[
              'px-2 py-1 rounded text-xs',
              step.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            ]"
          >
            {{ step.success ? 'Success' : 'Failed' }}
          </span>
        </div>
        
        <div class="mb-3">
          <label class="block text-sm text-gray-500 mb-1">Input Prompt</label>
          <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
            {{ step.input }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm text-gray-500 mb-1">Output</label>
          <div 
            :class="[
              'p-3 rounded text-sm',
              step.success 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : 'bg-red-50 dark:bg-red-900/20'
            ]"
          >
            <MarkdownRenderer :content="step.output" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '../utils/exportUtils';
import type { WorkflowExecution } from '../types/appTypes';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { AlertCircle, Check, X, GitBranch } from 'lucide-vue-next';

interface Props {
  execution: WorkflowExecution;
}

defineProps<Props>();
</script>

