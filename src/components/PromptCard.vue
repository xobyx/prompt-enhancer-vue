<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 md:p-6 shadow-sm transition-all relative',
      isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200',
      isEditing ? 'ring-2 ring-yellow-400 border-yellow-400' : ''
    ]"
  >
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
        {{ prompt.category || prompt.architecture_type || `Variant ${index + 1}` }}
      </h3>
      
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Copy Button -->
        <button
          @click="copyPrompt"
          class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Check
            v-if="copiedId === `prompt-${index}`"
            class="w-4 h-4 text-green-500"
          />
          <Copy v-else class="w-4 h-4" />
          {{ copiedId === `prompt-${index}` ? "Copied!" : "Copy" }}
        </button>

        <!-- Set as Initial Prompt Button -->
        <button
          @click="setAsInitialPrompt"
          class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Set as initial prompt"
        >
          <Check class="w-4 h-4" />
          Set Initial
        </button>

        <!-- Compare Toggle -->
        <div class="flex items-center gap-1.5">
          <input
            :id="`compare-${prompt.id}`"
            type="checkbox"
            :checked="isSelected"
            @change="toggleComparison"
            class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
          />
          <label
            :for="`compare-${prompt.id}`"
            class="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          >
            Compare
          </label>
        </div>

        <!-- Edit Controls -->
        <div class="flex items-center gap-1">
          <button
            v-if="!isEditing"
            @click="startEdit"
            class="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Edit Prompt"
          >
            <Edit class="w-4 h-4" />
          </button>

          <template v-if="isEditing">
            <button
              @click="saveEdit"
              :disabled="!hasChanges"
              class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save Changes"
            >
              <Check class="w-4 h-4" />
            </button>
            <button
              @click="cancelEdit"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Cancel Edit"
            >
              <X class="w-4 h-4" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-4">
      <!-- Enhanced Prompt Section -->
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          Enhanced Prompt:
          <span v-if="isEditing" class="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            Editing
          </span>
        </h4>
        
        <div v-if="isEditing" class="space-y-4">
          <textarea
            v-model="localEditContent"
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-vertical font-mono text-sm"
            placeholder="Enter your enhanced prompt here..."
          />
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Characters: {{ localEditContent.length }}
          </div>
        </div>
        
        <div
          v-else
          class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg max-h-96 overflow-y-auto border"
        >
          <MarkdownRenderer :content="prompt.prompt" />
        </div>
      </div>

      <!-- Reasoning Section -->
      <div v-if="prompt.reasoning && !isEditing">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Reasoning:
        </h4>
        <div class="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <MarkdownRenderer :content="prompt.reasoning" />
        </div>
      </div>

      <!-- Strengths Section -->
      <div v-if="prompt.strengths && !isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">
            Strengths:
          </h4>
          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li v-for="(strength, i) in prompt.strengths" :key="i" class="flex items-start gap-2">
              <span class="text-green-500 mt-0.5">•</span>
              {{ strength }}
            </li>
          </ul>
        </div>

        <!-- Ideal Use Cases Section -->
        <div v-if="prompt.ideal_use_cases">
          <h4 class="font-medium text-gray-900 dark:text-white mb-2">
            Ideal Use Cases:
          </h4>
          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li v-for="(useCase, i) in prompt.ideal_use_cases" :key="i" class="flex items-start gap-2">
              <span class="text-blue-500 mt-0.5">•</span>
              {{ useCase }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Test Section -->
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <TestTube2 class="w-4 h-4" />
          Test Prompt
        </h4>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Input
          </label>
          <div class="flex gap-2">
            <textarea
              v-model="localTestInput"
              placeholder="Enter test input to see how this prompt performs..."
              rows="2"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              @keydown.ctrl.enter="runTest"
              @keydown.meta.enter="runTest"
            />
            <button
              @click="runTest"
              :disabled="!canRunTest"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors min-w-[100px]"
            >
              <template v-if="isTesting">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Testing...
              </template>
              <template v-else>
                <TestTube2 class="w-4 h-4" />
                Test
              </template>
            </button>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to run test
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testOutput" class="space-y-3 animate-fadeIn">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Test Result:
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTimestamp(testOutput.timestamp) }}
            </div>
          </div>

          <div
            v-if="testOutput.error"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div class="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {{ testOutput.error }}
            </div>
          </div>

          <div v-else class="space-y-2">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                INPUT:
              </div>
              <div class="text-sm text-blue-800 dark:text-blue-200 font-mono">
                {{ testOutput.input }}
              </div>
            </div>
            <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                OUTPUT:
              </div>
              <div class="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap h-52 overflow-y-scroll">
                <MarkdownRenderer :content="testOutput.output"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Copy, Edit, X, TestTube2 } from "lucide-vue-next";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import type { PromptVariant } from "../types/appTypes";
import { computed, ref, watch, onMounted } from 'vue';

interface Props {
  prompt: PromptVariant;
  index: number;
  isSelected: boolean;
  copiedId: string;
  isEditing?: boolean;
  editedContent?: string;
  testInput?: string;
  testOutput?: {
    input: string;
    output: string;
    error?: string;
    timestamp: Date;
  };
  isTesting?: boolean;
}

interface Emits {
  (e: "copy", text: string, id: string): void;
  (e: "toggleComparison", variantId: string): void;
  (e: "setStartPrompt", text: string, id: string): void;
  (e: "startEdit", promptId: string, content: string): void;
  (e: "saveEdit", promptId: string, newContent: string): void;
  (e: "cancelEdit"): void;
  (e: "testPrompt", promptId: string, promptContent: string, testInput: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  editedContent: "",
  testInput: "",
  isTesting: false
});

const emit = defineEmits<Emits>();

// Reactive variables
const localEditContent = ref("");
const localTestInput = ref("");

// Initialize local content
onMounted(() => {
  localEditContent.value = props.editedContent || props.prompt.prompt;
  localTestInput.value = props.testInput || "";
});

// Watch for prop changes
watch(() => props.editedContent, (newContent) => {
  if (newContent !== undefined) {
    localEditContent.value = newContent;
  }
});

watch(() => props.testInput, (newInput) => {
  if (newInput !== undefined) {
    localTestInput.value = newInput;
  }
});

// Computed properties
const hasChanges = computed(() => {
  return localEditContent.value !== props.prompt.prompt;
});

const canRunTest = computed(() => {
  return !props.isTesting && localTestInput.value.trim().length > 0;
});

// Methods
const copyPrompt = () => {
  const textToCopy = props.isEditing ? localEditContent.value : props.prompt.prompt;
  emit("copy", textToCopy, `prompt-${props.index}`);
};

const setAsInitialPrompt = () => {
  const textToSet = props.isEditing ? localEditContent.value : props.prompt.prompt;
  emit("setStartPrompt", textToSet, `prompt-${props.index}`);
};

const toggleComparison = () => {
  emit("toggleComparison", props.prompt.id);
};

const startEdit = () => {
  localEditContent.value = props.prompt.prompt;
  emit("startEdit", props.prompt.id, props.prompt.prompt);
};

const saveEdit = () => {
  if (hasChanges.value) {
    emit("saveEdit", props.prompt.id, localEditContent.value);
  }
};

const cancelEdit = () => {
  localEditContent.value = props.prompt.prompt;
  emit("cancelEdit");
};

const runTest = () => {
  if (canRunTest.value) {
    const contentToTest = props.isEditing ? localEditContent.value : props.prompt.prompt;
    emit("testPrompt", props.prompt.id, contentToTest, localTestInput.value);
  }
};

const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleTimeString();
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>