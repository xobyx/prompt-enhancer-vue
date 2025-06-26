<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 md:p-6 shadow-sm transition-all relative',
      isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
    ]"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2"
    >
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0"
      >
        {{
          prompt.category || prompt.architecture_type || `Variant ${index + 1}`
        }}
      </h3>
      <div class="flex items-center gap-4 flex-shrink-0">
        <button
          @click="$emit('copy', prompt.prompt, `prompt-${index}`)"
          class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Check
            v-if="copiedId === `prompt-${index}`"
            class="w-4 h-4 text-green-500"
          />
          <Copy v-else class="w-4 h-4" />
          {{ copiedId === `prompt-${index}` ? "Copied!" : "Copy" }}
        </button>
        <button
          @click="$emit('setStartPrompt', prompt.prompt, `prompt-${index}`)"
          class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Check class="w-4 h-4 text-green-500" />

          set as initial prompt
        </button>
        <div class="flex items-center gap-1.5 justify-self-end">
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
        <div class="flex items-center gap-2">
          <!-- Edit button -->
          <button
            v-if="!isEditing"
            @click="startEdit"
            class="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Edit Prompt"
          >
            <Edit class="w-4 h-4" />
          </button>

          <!-- Save/Cancel buttons when editing -->
          <template v-if="isEditing">
            <button
              @click="saveEdit"
              class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
              title="Save Changes"
            >
              <Check class="w-4 h-4" />
            </button>
            <button
              @click="emit('cancelEdit')"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              title="Cancel Edit"
            >
              <X class="w-4 h-4" />
            </button>
          </template>

          <!-- Existing buttons... -->
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Enhanced Prompt:
        </h4>
        <div v-if="isEditing" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Edit Prompt
            </label>
            <textarea
              v-model="localEditContent"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
            />
          </div>
        </div>
        <div
          v-else
          class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg max-h-96 overflow-y-auto"
        >
          <MarkdownRenderer :content="prompt.prompt" />
        </div>
      </div>

      <div v-if="prompt.reasoning">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Reasoning:
        </h4>
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <MarkdownRenderer :content="prompt.reasoning" />
        </div>
      </div>

      <div v-if="prompt.strengths">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Strengths:
        </h4>
        <ul
          class="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1"
        >
          <li v-for="(strength, i) in prompt.strengths" :key="i">
            {{ strength }}
          </li>
        </ul>
      </div>

      <div v-if="prompt.ideal_use_cases">
        <h4 class="font-medium text-gray-900 dark:text-white mb-2">
          Ideal Use Cases:
        </h4>
        <ul
          class="text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1"
        >
          <li v-for="(useCase, i) in prompt.ideal_use_cases" :key="i">
            {{ useCase }}
          </li>
        </ul>
      </div>
    </div>
    <!-- Test Section -->
    <div
      class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
    >
      <div class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Test Input
          </label>
          <div class="flex gap-2">
            <textarea
              v-model="localTestInput"
              placeholder="Enter test input to see how this prompt performs..."
              rows="2"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              @click="runTest"
              :disabled="!localTestInput.trim() || isTesting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
            >
              <template v-if="isTesting">
                <div
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
                Testing...
              </template>
              <template v-else>
                <TestTube2 class="w-4 h-4" />
                Test
              </template>
            </button>
          </div>
        </div>

        <!-- Test Results -->
        <div v-if="testOutput" class="space-y-3">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Test Result:
          </div>

          <div
            v-if="testOutput.error"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div class="text-sm text-red-800 dark:text-red-200">
              Error: {{ testOutput.error }}
            </div>
          </div>

          <div v-else class="space-y-2">
            <div
              class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div
                class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1"
              >
                INPUT:
              </div>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                {{ testOutput.input }}
              </div>
            </div>
            <div
              class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div
                class="text-xs text-green-600 dark:text-green-400 font-medium mb-1"
              >
                OUTPUT:
              </div>
              <div
                class="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap"
              >
                {{ testOutput.output }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Copy ,Edit,X,TestTube2} from "lucide-vue-next";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import type { PromptVariant } from "../types/appTypes";
import { computed, watch, onMounted ,ref} from 'vue';
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
  (
    e: "testPrompt",
    promptId: string,
    promptContent: string,
    testInput: string
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  editedContent: "",
  testInput: "",
  isTesting: false
});
//defineProps<Props>();
const emit = defineEmits<Emits>();

// Add these reactive variables
const localEditContent = ref("");
const localTestInput = ref("");

// Add these methods
const startEdit = () => {
  localEditContent.value = props.prompt.prompt;
  emit("startEdit", props.prompt.id, props.prompt.prompt);
};

const saveEdit = () => {
  emit("saveEdit", props.prompt.id, localEditContent.value);
};

const runTest = () => {
  const contentToTest = props.isEditing
    ? localEditContent.value
    : props.prompt.prompt;
  emit("testPrompt", props.prompt.id, contentToTest, localTestInput.value);
};
</script>
