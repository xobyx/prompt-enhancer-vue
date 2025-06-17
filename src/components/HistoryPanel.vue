<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
    <div class="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6 shadow-xl flex flex-col">
      <div class="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          History for: {{ activeProjectName }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="promptHistory.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
        No history in this project yet.
      </div>
      
      <div v-else class="space-y-4 overflow-y-auto">
        <div 
          v-for="item in promptHistory"
          :key="item.id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click="$emit('loadFromHistory', item)"
        >
          <p 
            class="font-medium text-gray-900 dark:text-white truncate" 
            :title="item.inputPrompt"
          >
            {{ item.inputPrompt }}
          </p>
          <div class="flex justify-between mt-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(item.timestamp) }}
            </span>
            <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              {{ getVersionName(item.version) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { PromptHistoryItem } from '../types/appTypes';
import { formatDate } from '../utils/exportUtils';
import { promptVersions } from '../constants/appConstants';

interface Props {
  activeProjectName: string;
  promptHistory: PromptHistoryItem[];
}

interface Emits {
  (e: 'loadFromHistory', item: PromptHistoryItem): void;
  (e: 'close'): void;
}

defineProps<Props>();
defineEmits<Emits>();

const getVersionName = (version: string): string => {
  return promptVersions[version as keyof typeof promptVersions]?.name || version;
};
</script>

