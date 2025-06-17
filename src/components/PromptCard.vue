<template>
  <div :class="[
    'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 md:p-6 shadow-sm transition-all relative',
    isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
  ]">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
        {{ prompt.category || prompt.architecture_type || `Variant ${index + 1}` }}
      </h3>
      <div class="flex items-center gap-4 flex-shrink-0">
        <button 
          @click="$emit('copy', prompt.prompt, `prompt-${index}`)" 
          class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Check v-if="copiedId === `prompt-${index}`" class="w-4 h-4 text-green-500" />
          <Copy v-else class="w-4 h-4" />
          {{ copiedId === `prompt-${index}` ? "Copied!" : "Copy" }}
        </button>
        <div class="flex items-center gap-1.5">
          <input 
            :id="`compare-${prompt.id}`"
            type="checkbox" 
            :checked="isSelected" 
            @change="$emit('toggleComparison', prompt.id)"
            class="w-4 h-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
          />
          <label 
            :for="`compare-${prompt.id}`"
            class="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          >
            Compare
          </label>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">Enhanced Prompt:</h4>
        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <MarkdownRenderer :content="prompt.prompt" />
        </div>
      </div>
      
      <div v-if="prompt.reasoning">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">Reasoning:</h4>
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <MarkdownRenderer :content="prompt.reasoning" />
        </div>
      </div>
      
      <div v-if="prompt.strengths">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">Strengths:</h4>
        <ul class="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
          <li v-for="(strength, i) in prompt.strengths" :key="i">{{ strength }}</li>
        </ul>
      </div>
      
      <div v-if="prompt.ideal_use_cases">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">Ideal Use Cases:</h4>
        <ul class="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
          <li v-for="(useCase, i) in prompt.ideal_use_cases" :key="i">{{ useCase }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next';
import MarkdownRenderer from './MarkdownRenderer.vue';
import type { PromptVariant } from '../types/appTypes';

interface Props {
  prompt: PromptVariant;
  index: number;
  isSelected: boolean;
  copiedId: string;
}

interface Emits {
  (e: 'copy', text: string, id: string): void;
  (e: 'toggleComparison', variantId: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

