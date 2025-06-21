<template>
  <div class="bg-white dark:bg-gray-900 min-h-screen">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$emit('back')"
              class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Go back"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Reverse Engineering Prompts
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Analyze AI outputs to infer the prompts that generated them
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="handleClearAll"
              :disabled="isProcessing || isTesting"
              class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="[
          'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm',
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        ]"
      >
        <div class="flex items-center space-x-2">
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 flex-shrink-0" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 flex-shrink-0" />
          <Info v-else class="w-5 h-5 flex-shrink-0" />
          <span class="text-sm font-medium">{{ toast.message }}</span>
          <button 
            @click="hideToast"
            class="ml-auto p-1 hover:bg-black/10 rounded"
            aria-label="Close notification"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <main class="p-6 max-w-7xl mx-auto">
      <!-- Input Section -->
      <section class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <FileText class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              AI-Generated Output
            </h2>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Paste the AI-generated text that you want to reverse engineer. The system will analyze it and suggest a prompt that could have produced this output.
          </p>
          <div class="relative">
            <textarea
              v-model="originalOutput"
              placeholder="Paste the AI-generated text here..."
              class="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              maxlength="10000"
              @paste="handlePaste"
              :disabled="isProcessing"
            ></textarea>
            <div 
              v-if="originalOutput.length > 8000" 
              class="absolute top-2 right-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs"
            >
              Large input - processing may take longer
            </div>
          </div>
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ originalOutput.length.toLocaleString() }} / 10,000 characters
            </div>
            <button
              @click="handleReverseEngineer"
              :disabled="!isValidInput || isProcessing"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Search v-if="!isProcessing" class="w-4 h-4" />
              <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isProcessing ? 'Analyzing...' : 'Reverse Engineer Prompt' }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section v-if="showResults" class="space-y-6">
        <!-- Inferred Prompt -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <Lightbulb class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Inferred Prompt
              </h2>
            </div>
            <div v-if="analysis.confidence" class="flex items-center space-x-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
              <div class="flex items-center space-x-1">
                <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                    :style="{ width: `${analysis.confidence}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ analysis.confidence }}%
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="isProcessing">
            <LoadingSkeleton />
          </div>
          
          <div v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Based on the analysis, here's the prompt that likely generated the output:
            </p>
            <div class="relative">
              <textarea
                v-model="inferredPrompt"
                class="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                placeholder="Inferred prompt will appear here..."
                readonly
              ></textarea>
              <button
                v-if="inferredPrompt"
                @click="togglePromptEditing"
                class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                :title="isPromptEditable ? 'Lock editing' : 'Enable editing'"
              >
                <Lock v-if="!isPromptEditable" class="w-4 h-4" />
                <Unlock v-else class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Analysis Details -->
            <div v-if="analysis.reasoning" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Analysis Reasoning</h3>
              <MarkdownRenderer :content="analysis.reasoning"/>  
            </div>

            <!-- Suggested Improvements -->
            <div v-if="analysis.suggestedImprovements?.length" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Suggested Improvements</h3>
              <ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li v-for="(improvement, index) in analysis.suggestedImprovements" :key="index" class="flex items-start space-x-2">
                  <span class="text-blue-500 mt-1">•</span>
                    <MarkdownRenderer :content="improvement"/>
                </li>
              </ul>
            </div>
            
            <div class="flex justify-between items-center mt-4">
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ inferredPrompt.length.toLocaleString() }} characters
              </div>
              <div class="flex space-x-2">
                <button
                  @click="handleCopyPrompt"
                  :disabled="!inferredPrompt.trim()"
                  class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <Copy class="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  @click="handleTestPrompt"
                  :disabled="!inferredPrompt.trim() || isTesting"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Play v-if="!isTesting" class="w-4 h-4" />
                  <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{{ isTesting ? 'Testing...' : 'Test Prompt' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparison Section -->
        <div v-if="showComparison" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center space-x-2 mb-4">
            <GitCompare class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Comparison
            </h2>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Compare the original output with the output generated by the inferred prompt:
          </p>
          
          <div v-if="isTesting">
            <LoadingSkeleton />
          </div>
          
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Original Output -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <span>Original Output</span>
                <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {{ originalOutput.length.toLocaleString() }} chars
                </span>
              </h3>
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                <MarkdownRenderer :content="originalOutput" />
              </div>
            </div>
            
            <!-- Inferred Output -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <span>Inferred Prompt Output</span>
                <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {{ inferredOutput.length.toLocaleString() }} chars
                </span>
              </h3>
              <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                <MarkdownRenderer :content="inferredOutput" />
              </div>
            </div>
          </div>
          
          <!-- Similarity Assessment -->
          <div v-if="inferredOutput && !isTesting" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center space-x-2">
              <Target class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
                Similarity Assessment
              </span>
            </div>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Compare the outputs manually to assess how well the inferred prompt captures the original intent. 
              Look for similarities in structure, tone, content, and formatting.
            </p>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="!originalOutput && !inferredPrompt" class="text-center py-12">
        <Search class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Ready to Reverse Engineer
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Paste an AI-generated text output above to analyze it and discover the prompt that likely created it.
        </p>
      </div>
    </main>
    <Rtool/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Lightbulb, 
  Copy, 
  Play, 
  GitCompare, 
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Lock,
  Unlock
} from 'lucide-vue-next'
import LoadingSkeleton from './LoadingSkeleton.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import Rtool from './Rtool.vue'
import { inferPromptFromOutput, enhancePrompt, analyzeOutputStructure } from '../utils/reverseUtils'

// Types
interface AnalysisResult {
  inferredPrompt: string
  confidence: number
  reasoning: string
  suggestedImprovements: string[]
}

interface Toast {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info'
}

// Emits
interface Emits {
  (e: 'back'): void
}

const emit = defineEmits<Emits>()

// Reactive state
const originalOutput = ref('')
const inferredPrompt = ref('')
const inferredOutput = ref('')
const isProcessing = ref(false)
const isTesting = ref(false)
const isPromptEditable = ref(false)
const analysis = ref<AnalysisResult>({
  inferredPrompt: '',
  confidence: 0,
  reasoning: '',
  suggestedImprovements: []
})

// Toast state
const toast = ref<Toast>({
  show: false,
  message: '',
  type: 'info'
})

// Computed properties
const isValidInput = computed(() => {
  return originalOutput.value.trim().length >= 10
})

const showResults = computed(() => {
  return inferredPrompt.value || isProcessing.value
})

const showComparison = computed(() => {
  return inferredOutput.value || isTesting.value
})

// Toast methods
const showToast = (message: string, type: Toast['type'] = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(hideToast, 4000)
}

const hideToast = () => {
  toast.value.show = false
}

// Utility methods
const handlePaste = async (event: ClipboardEvent) => {
  // Add a small delay to let the paste complete
  await nextTick()
  if (originalOutput.value.length > 10000) {
    originalOutput.value = originalOutput.value.substring(0, 10000)
    showToast('Input truncated to 10,000 characters', 'info')
  }
}

const togglePromptEditing = () => {
  isPromptEditable.value = !isPromptEditable.value
  // If making editable, focus the textarea
  if (isPromptEditable.value) {
    nextTick(() => {
      const textarea = document.querySelector('textarea[v-model="inferredPrompt"]') as HTMLTextAreaElement
      textarea?.focus()
    })
  }
}

// Main methods
const handleClearAll = () => {
  if (isProcessing.value || isTesting.value) {
    showToast('Cannot clear while processing', 'error')
    return
  }
  
  originalOutput.value = ''
  inferredPrompt.value = ''
  inferredOutput.value = ''
  analysis.value = {
    inferredPrompt: '',
    confidence: 0,
    reasoning: '',
    suggestedImprovements: []
  }
  showToast('All content cleared', 'success')
}

const handleReverseEngineer = async () => {
  if (!isValidInput.value) {
    showToast('Please enter at least 10 characters', 'error')
    return
  }
  
  isProcessing.value = true
  
  try {
    // Run both analyses in parallel for better performance
    const [basicPrompt, detailedAnalysis] = await Promise.all([
      inferPromptFromOutput(originalOutput.value),
      analyzeOutputStructure(originalOutput.value).catch(() => ({
        inferredPrompt: '',
        confidence: 0,
        reasoning: '',
        suggestedImprovements: []
      }))
    ])
    
    // Use the detailed analysis if available, otherwise fall back to basic
    inferredPrompt.value = detailedAnalysis.inferredPrompt || basicPrompt
    analysis.value = detailedAnalysis
    
    showToast('Prompt successfully reverse engineered!', 'success')
  } catch (error) {
    console.error('Error inferring prompt:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    showToast(`Failed to reverse engineer prompt: ${errorMessage}`, 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleTestPrompt = async () => {
  if (!inferredPrompt.value.trim()) {
    showToast('No prompt to test', 'error')
    return
  }
  
  isTesting.value = true
  
  try {
    const result = await enhancePrompt(inferredPrompt.value, '')
    inferredOutput.value = result
    showToast('Prompt test completed successfully!', 'success')
  } catch (error) {
    console.error('Error testing prompt:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    showToast(`Failed to test prompt: ${errorMessage}`, 'error')
  } finally {
    isTesting.value = false
  }
}

const handleCopyPrompt = async () => {
  if (!inferredPrompt.value.trim()) {
    showToast('No prompt to copy', 'error')
    return
  }
  
  try {
    await navigator.clipboard.writeText(inferredPrompt.value)
    showToast('Prompt copied to clipboard!', 'success')
  } catch (error) {
    console.error('Error copying prompt:', error)
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = inferredPrompt.value
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast('Prompt copied to clipboard!', 'success')
    } catch (fallbackError) {
      showToast('Failed to copy prompt. Please select and copy manually.', 'error')
    }
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Improved focus styles */
textarea:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Loading skeleton animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>