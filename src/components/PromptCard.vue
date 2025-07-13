<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 relative',
      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-100 dark:shadow-blue-900/20' : 'border-gray-200 hover:border-gray-300 dark:hover:border-gray-600',
      isEditing ? 'ring-2 ring-yellow-400/50 border-yellow-400 shadow-yellow-100 dark:shadow-yellow-900/20' : ''
    ]"
    :style="{ transform: isSelected ? 'translateY(-2px)' : 'translateY(0)' }"
  >
    <!-- Status Indicators -->
    <div class="absolute top-3 right-3 flex items-center gap-2">
      <div v-if="isEditing" class="flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
        <Edit class="w-3 h-3" />
        Editing
      </div>
      <div v-if="isSelected" class="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
        <Check class="w-3 h-3" />
        Selected
      </div>
      <div v-if="hasTestResults" class="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
        <TestTube2 class="w-3 h-3" />
        Tested
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3 pr-20">
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ getPromptTitle }}
        </h3>
        <div v-if="getPromptSubtitle" class="text-sm text-gray-500 dark:text-gray-400">
          {{ getPromptSubtitle }}
        </div>
        <div v-if="prompt.optimization_target" class="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
          <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
          Optimized for: {{ prompt.optimization_target }}
        </div>
      </div>
      
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Action Buttons Group -->
        <div class="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1 gap-1">
          <!-- Copy Button -->
          <button
            @click="copyPrompt"
            :class="[
              'flex items-center gap-1.5 text-sm cursor-pointer px-2 py-1.5 rounded-md transition-all duration-200',
              copiedId === `prompt-${index}` 
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600'
            ]"
            :title="copiedId === `prompt-${index}` ? 'Copied to clipboard!' : 'Copy prompt to clipboard'"
          >
            <Check
              v-if="copiedId === `prompt-${index}`"
              class="w-4 h-4 animate-pulse"
            />
            <Copy v-else class="w-4 h-4" />
            <span class="hidden sm:inline">{{ copiedId === `prompt-${index}` ? "Copied!" : "Copy" }}</span>
          </button>

          <!-- Set as Initial Prompt Button -->
          <button
            @click="setAsInitialPrompt"
            class="flex items-center gap-1.5 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-2 py-1.5 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
            title="Set as initial prompt for new iterations"
          >
            <Star class="w-4 h-4" />
            <span class="hidden sm:inline">Set Initial</span>
          </button>

          <!-- Edit Controls -->
          <div class="flex items-center">
            <button
              v-if="!isEditing"
              @click="startEdit"
              class="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-all duration-200"
              title="Edit Prompt"
            >
              <Edit class="w-4 h-4" />
            </button>

            <template v-if="isEditing">
              <button
                @click="saveEdit"
                :disabled="!hasChanges"
                class="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Save Changes"
              >
                <Check class="w-4 h-4" />
              </button>
              <button
                @click="cancelEdit"
                class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                title="Cancel Edit"
              >
                <X class="w-4 h-4" />
              </button>
            </template>
          </div>
        </div>

        <!-- Compare Toggle -->
        <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
          <input
            :id="`compare-${prompt.id}`"
            type="checkbox"
            :checked="isSelected"
            @change="toggleComparison"
            class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-600 cursor-pointer transition-colors"
          />
          <label
            :for="`compare-${prompt.id}`"
            class="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none"
          >
            Compare
          </label>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Enhanced Prompt Section -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare class="w-4 h-4" />
            Enhanced Prompt
          </h4>
          <div v-if="!isEditing" class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {{ getPromptStats }}
          </div>
        </div>
        
        <div v-if="isEditing" class="space-y-4">
          <div class="relative">
            <textarea
              v-model="localEditContent"
              ref="editTextarea"
              rows="8"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical font-mono text-sm leading-relaxed"
              placeholder="Enter your enhanced prompt here..."
              @input="updateCharCount"
            />
            <div class="absolute bottom-2 right-2 text-xs text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              {{ localEditContent.length }} chars
            </div>
          </div>
          
          <!-- Edit Toolbar -->
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div class="flex items-center gap-4">
              <span>Words: {{ getWordCount(localEditContent) }}</span>
              <span>Lines: {{ getLineCount(localEditContent) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="formatPrompt"
                class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Format prompt"
              >
                <AlignLeft class="w-3 h-3" />
              </button>
              <button
                @click="clearPrompt"
                class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-red-500"
                title="Clear prompt"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div
          v-else
          class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-lg max-w-full max-h-96 overflow-x-auto overflow-y-auto border border-gray-200 dark:border-gray-600"
        >
          <MarkdownRenderer :content="prompt.prompt" />
        </div>
      </div>

      <!-- Metadata Grid -->
      <div v-if="!isEditing && hasMetadata" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Reasoning Section -->
        <div v-if="prompt.reasoning" class="space-y-3">
          <h4 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Brain class="w-4 h-4" />
            Reasoning
          </h4>
          <div class="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <MarkdownRenderer :content="prompt.reasoning" />
          </div>
        </div>

        <!-- Strengths & Use Cases -->
        <div v-if="prompt.strengths || p_usage.length" class="space-y-4">
          <!-- Strengths -->
          <div v-if="prompt.strengths">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp class="w-4 h-4" />
              Strengths
            </h4>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li v-for="(strength, i) in prompt.strengths" :key="i" class="flex items-start gap-3 p-2 bg-green-50 dark:bg-green-900/10 rounded-md">
                <CheckCircle class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{{ strength }}</span>
              </li>
            </ul>
          </div>

          <!-- Ideal Use Cases -->
          <div v-if="p_usage.length">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Target class="w-4 h-4" />
              Ideal Use Cases
            </h4>
            <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li v-for="(useCase, i) in p_usage" :key="i" class="flex items-start gap-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-md">
                <ArrowRight class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{{ useCase }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Generation Config -->
      <div v-if="prompt.appropriate_generation_config && !isEditing" 
           class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-4">
        
        <h4 class="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings class="w-4 h-4" />
          Generation Configuration
        </h4>
      
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="[key, value] in Object.entries(prompt.appropriate_generation_config)" 
               :key="key" 
               class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-indigo-100 dark:border-indigo-800 hover:shadow-sm transition-shadow">
            <template v-if="key !== 'reason'">
              <span class="text-gray-700 dark:text-gray-300 font-medium capitalize">{{ formatConfigKey(key) }}</span>
              <span class="bg-indigo-500 text-white px-2 py-1 rounded text-sm font-medium">{{ value }}</span>
            </template>
            <template v-else>
              <div class="w-full">
                <span class="text-gray-600 dark:text-gray-400 text-sm italic">{{ value }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Section -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800/50 dark:to-gray-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <TestTube2 class="w-4 h-4" />
              Test Prompt
              <span v-if="hasTestResults" class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                Last tested: {{ formatTimestamp(testOutput?.timestamp) }}
              </span>
            </h4>
            <button
              v-if="hasTestResults"
              @click="clearTestResults"
              class="text-xs text-gray-500 hover:text-red-500 p-1 rounded transition-colors"
              title="Clear test results"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
          
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Test Input
            </label>
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <textarea
                  v-model="localTestInput"
                  placeholder="Enter test input to see how this prompt performs..."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
                  @keydown.ctrl.enter="runTest"
                  @keydown.meta.enter="runTest"
                />
                <div class="absolute bottom-2 right-2 text-xs text-gray-400">
                  {{ localTestInput.length }} chars
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  @click="runTest"
                  :disabled="!canRunTest"
                  :class="[
                    'px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 min-w-[100px] justify-center',
                    canRunTest 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  ]"
                >
                  <template v-if="isTesting">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span class="hidden sm:inline">Testing...</span>
                  </template>
                  <template v-else>
                    <TestTube2 class="w-4 h-4" />
                    <span class="hidden sm:inline">Test</span>
                  </template>
                </button>
                <button
                  v-if="savedTestInputs.length"
                  @click="showSavedInputs = !showSavedInputs"
                  class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded transition-colors"
                  title="Load saved test inputs"
                >
                  <History class="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <!-- Saved Test Inputs -->
            <div v-if="showSavedInputs && savedTestInputs.length" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Test Inputs:</div>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <button
                  v-for="(input, i) in savedTestInputs.slice(0, 5)"
                  :key="i"
                  @click="loadTestInput(input)"
                  class="w-full text-left text-xs p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors truncate"
                >
                  {{ input }}
                </button>
              </div>
            </div>
            
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Keyboard class="w-3 h-3" />
              Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to run test
            </div>
          </div>

          <!-- Test Results -->
          <div v-if="testOutput" class="space-y-4 animate-slideIn">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock class="w-4 h-4" />
                Test Result
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="saveTestResult"
                  class="text-xs text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                  title="Save test result"
                >
                  <BookmarkPlus class="w-3 h-3" />
                </button>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTimestamp(testOutput.timestamp) }}
                </div>
              </div>
            </div>

            <div
              v-if="testOutput.error"
              class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <AlertCircle class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div class="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Test Failed
                  </div>
                  <div class="text-sm text-red-700 dark:text-red-300">
                    {{ testOutput.error }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                  <ArrowRight class="w-3 h-3" />
                  INPUT
                </div>
                <div class="text-sm text-blue-800 dark:text-blue-200 font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  {{ testOutput.input }}
                </div>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                  <ArrowLeft class="w-3 h-3" />
                  OUTPUT
                </div>
                <div class="text-sm text-green-800 dark:text-green-200 max-h-64 overflow-y-auto bg-green-100 dark:bg-green-900/30 p-3 rounded">
                  <MarkdownRenderer :content="testOutput.output"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Check, Copy, Edit, X, TestTube2, MessageSquare, Brain, TrendingUp, 
  Target, Settings, Star, ArrowRight, ArrowLeft, CheckCircle, 
  AlertCircle, Clock, Keyboard, History, BookmarkPlus, Trash2, 
  AlignLeft
} from "lucide-vue-next";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import type { PromptVariant} from "../types/appTypes";
import { computed, ref, watch, onMounted, nextTick } from 'vue';

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

const loadTestInput = () => {
  const saved = localStorage.getItem(`savedTestInputs-${props.prompt.id}`);
  savedTestInputs.value = saved ? JSON.parse(saved) : [];
};



const saveTestInput = (input: string) => {
  if (!input.trim()) return;
  
  // Avoid duplicates
  if (!savedTestInputs.value.includes(input)) {
    savedTestInputs.value = [input, ...savedTestInputs.value].slice(0, 10); // Keep last 10
    localStorage.setItem(
      `savedTestInputs-${props.prompt.id}`, 
      JSON.stringify(savedTestInputs.value)
    );
  }
};

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
const showSavedInputs = ref(false);
const savedTestInputs = ref<string[]>([]);
const editTextarea = ref<HTMLTextAreaElement>();

// Initialize local content
onMounted(() => {
  localEditContent.value = props.editedContent || props.prompt.prompt;
  localTestInput.value = props.testInput || "";
  loadTestInput();
});

// Computed properties
const p_usage = computed(() => {
  if (props.prompt.ideal_use_cases && props.prompt.ideal_use_cases.length) {
    return props.prompt.ideal_use_cases;
  } else if (props.prompt.best_applications && props.prompt.best_applications.length) {
    return props.prompt.best_applications;
  } else {
    return [];
  }
});


const getPromptTitle = computed(() => {
  return props.prompt.category || 
         props.prompt.architecture_type || 
         props.prompt.optimization_target || 
         `Prompt Variant ${props.index + 1}`;
});

const getPromptSubtitle = computed(() => {
  const parts = [];
  if (props.prompt.category && props.prompt.architecture_type) {
    parts.push(`${props.prompt.architecture_type} Architecture`);
  }
  if (props.prompt.version) {
    parts.push(`v${props.prompt.version}`);
  }
  return parts.join(' • ');
});

const getPromptStats = computed(() => {
  const content = props.prompt.prompt;
  const words = content.split(/\s+/).filter(word => word.length > 0).length;
  const chars = content.length;
  return `${words} words • ${chars} chars`;
});

const hasMetadata = computed(() => {
  return props.prompt.reasoning || props.prompt.strengths || p_usage.value.length > 0;
});

const hasTestResults = computed(() => {
  return props.testOutput !== undefined;
});

const hasChanges = computed(() => {
  return localEditContent.value !== props.prompt.prompt;
});

const canRunTest = computed(() => {
  return !props.isTesting && localTestInput.value.trim().length > 0;
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
  nextTick(() => {
    editTextarea.value?.focus();
  });
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
    saveTestInput(localTestInput.value);
  }
};

const clearTestResults = () => {
  localTestInput.value = "";
  emit("clearTestResults", props.prompt.id);
};

const saveTestResult = () => {
  if (!props.testOutput) return;
  emit("saveTestResult", {
    promptId: props.prompt.id,
    ...props.testOutput
  });
};

const formatTimestamp = (timestamp?: Date) => {
  if (!timestamp) return '';
  return timestamp.toLocaleTimeString();
};

const formatConfigKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getWordCount = (text: string) => {
  return text.split(/\s+/).filter(word => word.length > 0).length;
};

const getLineCount = (text: string) => {
  return text.split('\n').length;
};

const updateCharCount = () => {
  // This is called on input to trigger reactivity
};

const formatPrompt = () => {
  // Basic formatting - could be enhanced
 // localEditContent.value = localEditContent.value
}

/*&&&&&&&&&&&&&&*/




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