<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
    <div class="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6 shadow-xl flex flex-col">
      <div class="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          History for: {{ activeProjectName }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close history panel"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="promptHistory.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
        No history in this project yet.
      </div>
      
      <div v-else class="space-y-4 flex-1 overflow-y-auto">
        <div 
          v-for="item in promptHistory"
          :key="item.id"
          class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @click="$emit('loadFromHistory', item)"
          @keydown.enter="$emit('loadFromHistory', item)"
          @keydown.space.prevent="$emit('loadFromHistory', item)"
          tabindex="0"
          role="button"
          :aria-label="`Load history item: ${item.inputPrompt}`"
        >
          <p 
            class="font-medium text-gray-900 dark:text-white truncate" 
            :title="item.inputPrompt"
          >
            {{ item.inputPrompt }}
          </p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatDate(item.timestamp) }}
            </span>
            <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
              {{ getVersionName(item.version) }}
            </span>
          </div>
          
          <!-- Clarifying Questions Section -->
          <div v-if="item.questionAnswers && Object.keys(item.questionAnswers).length > 0" 
               class="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <MessageSquare class="w-4 h-4" />
              Clarifying Questions & Answers
              <span v-if="item.reEnhanced" class="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                Re-enhanced
              </span>
            </h4>
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div v-for="(answer, question) in item.questionAnswers" :key="question" 
                   class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Q:</div>
                <div class="text-sm text-gray-800 dark:text-gray-200 mb-2 break-words">{{ question }}</div>
                <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">A:</div>
                <div class="text-sm text-blue-800 dark:text-blue-200 break-words">{{ answer }}</div>
              </div>
            </div>
            <div v-if="item.reEnhancedAt" class="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Re-enhanced on 
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, MessageSquare } from 'lucide-vue-next';
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