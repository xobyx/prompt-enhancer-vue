<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 my-8 border border-blue-200 dark:border-blue-800">
    <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
      <TestTube2 class="text-blue-500" />
      Prompt Comparison Test
    </h2>
    
    <div class="space-y-4 mb-6">
      <p class="text-gray-600 dark:text-gray-400">
        Enter a common test prompt to see how each selected variant performs.
      </p>
      
      <textarea
        v-model="testPrompt"
        placeholder="e.g., 'Explain the concept of quantum computing to a 10-year-old.'"
        rows="3"
        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
      />
      
      <button
        @click="handleRun"
        :disabled="isComparing || !testPrompt.trim() || !apiKey"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        <template v-if="isComparing">
          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Running Comparison...
        </template>
        <template v-else>
          Run Comparison Test
        </template>
      </button>
    </div>

    <div 
      v-if="comparisonResults.length > 0"
      :class="[
        'grid grid-cols-1 md:grid-cols-2 gap-4',
        selectedVariants.length >= 3 ? 'lg:grid-cols-3' : ''
      ]"
    >
      <div 
        v-for="variant in selectedVariants"
        :key="variant.id"
        class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border dark:border-gray-700 flex flex-col"
      >
        <h3 class="font-semibold text-lg mb-2 text-gray-800 dark:text-white truncate">
          {{ variant.category || variant.architecture_type }}
        </h3>
        
        <div class="prose prose-sm dark:prose-invert max-w-none h-96 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded flex-grow">
          <div 
            v-if="getResultForVariant(variant.id)?.loading"
            class="text-center p-8 text-gray-500 flex items-center justify-center h-full"
          >
            Generating...
          </div>
          
          <div 
            v-else-if="getResultForVariant(variant.id)?.error"
            class="text-red-500 p-2"
          >
            Error: {{ getResultForVariant(variant.id)?.error }}
          </div>
          
          <MarkdownRenderer 
            v-else-if="getResultForVariant(variant.id)?.output"
            :content="getResultForVariant(variant.id)!.output"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TestTube2 } from 'lucide-vue-next';
import MarkdownRenderer from './MarkdownRenderer.vue';
import type { ComparisonResult, PromptVariant } from '../types/appTypes';

interface Props {
  selectedVariants: PromptVariant[];
  comparisonResults: ComparisonResult[];
  isComparing: boolean;
  apiKey: string;
}

interface Emits {
  (e: 'runComparison', testPrompt: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const testPrompt = ref('');

const handleRun = () => {
  if (!testPrompt.value.trim() || !props.apiKey) return;
  emit('runComparison', testPrompt.value);
};

const getResultForVariant = (variantId: string): ComparisonResult | undefined => {
  return props.comparisonResults.find(r => r.variantId === variantId);
};
</script>

