<template>
  <div class="flex h-screen w-full">
    <ProjectSidebar
      :projects="store.projects"
      :active-project-id="store.activeProjectId"
      :is-open="store.isSidebarOpen"
      @select-project="store.selectProject"
      @create-project="store.createProject"
      @close="store.isSidebarOpen = false"
    />
    
    <main class="flex-1 h-screen overflow-y-auto">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div class="flex items-center gap-4">
            <button 
              @click="store.isSidebarOpen = true" 
              class="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md md:hidden" 
              title="Show Projects"
            >
              <LayoutGrid class="w-5 h-5" />
            </button>
            <div class="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Bot class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Prompt Engineering Assistant
            </h1>
          </div>
          </div>

        <!-- Main Form -->
        <div class="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- API Key -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Google Gemini API Key</label>
              <input 
                v-model="store.apiKey"
                type="password" 
                placeholder="Enter your Google Gemini API key" 
                class="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm focus:shadow-md" 
                required
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div class="w-1 h-1 bg-green-500 rounded-full"></div>
                Your key is stored locally and never sent to our servers.
              </p>
            </div>
            
            <!-- Enhancement Approach -->
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Enhancement Approach</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  v-for="(version, key) in promptVersions"
                  :key="key" 
                  @click="store.selectedVersion = key" 
                  :class="[
                    'p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-lg',
                    store.selectedVersion === key 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/30'
                  ]"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <div :class="[
                      'p-2 rounded-lg transition-colors',
                      store.selectedVersion === key ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    ]">
                      <component :is="version.icon" class="w-5 h-5" />
                    </div>
                    <h3 class="font-bold text-gray-900 dark:text-white">{{ version.name }}</h3>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ version.description }}</p>
                </div>
              </div>
            </div>
            
            <!-- Input Prompt -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">Original Prompt to Enhance</label>
              <textarea 
                v-model="store.inputPrompt"
                placeholder="Enter your prompt that you want to enhance..." 
                rows="8" 
                class="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-vertical transition-all duration-200 shadow-sm focus:shadow-md" 
                required
              />
              <VariableEditor v-if="store.variableDefinitions.length > 0" />
  
              <!-- Add variable button -->
              <button 
                @click="store.addVariable('var1')"
                type="button"
                class="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Plus class="w-4 h-4 mr-2" /> Add Variables to Prompt
              </button>
            </div>

            <!-- Model Parameters -->
            <details class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <summary class="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 flex justify-between items-center hover:text-gray-900 dark:hover:text-white transition-colors">
                Model & Generation Parameters 
                <ChevronsUpDown class="w-5 h-5 text-gray-500" />
              </summary>
              <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Model</label>
                  <select 
                    v-model="store.modelParams.model"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 shadow-sm focus:shadow-md"
                  >
                    <option value="gemini-2.5-flash-preview-04-17">gemini-2.5-flash-preview-04-17</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Temperature: {{ store.modelParams.temperature }}
                  </label>
                  <input 
                    v-model="store.modelParams.temperature"
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Tokens</label>
                  <input 
                    v-model="store.modelParams.maxOutputTokens"
                    type="number" 
                    min="1" 
                    max="8192" 
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700/50 dark:text-white transition-all duration-200 shadow-sm focus:shadow-md"
                  />
                </div>
              </div>
            </details>
            
            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-2">
              <button
                type="submit"
                :disabled="store.loading"
                class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <template v-if="store.loading && !store.isComparing">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enhancing...
                </template>
                <template v-else>
                  <Zap class="w-5 h-5" />
                  Enhance Prompt
                </template>
              </button>
              <button 
                v-if="store.result"
                @click="store.resetForm" 
                type="button"
                class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RotateCw class="w-5 h-5" />
                New Session
              </button>
            </div>
          </form>
        </div>

        <!-- Error Display -->
        <div v-if="store.error" class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl p-6 mb-8 flex items-center gap-3 shadow-sm">
          <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
            <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div class="font-medium">{{ store.error }}</div>
        </div>
        
        <!-- Loading Skeleton -->
        <LoadingSkeleton v-if="store.loading" />
        
        <!-- Comparison Panel -->
        <ComparisonPanel
          v-if="store.selectedVariantsForComparison.length > 0"
          :selected-variants="selectedVariantsForComparison"
          :comparison-results="store.comparisonResults"
          :is-comparing="store.isComparing"
          :api-key="store.apiKey"
          @run-comparison="handleRunComparison"
        />

        <!-- Results -->
        <div v-if="store.result && !store.loading" class="space-y-8">
          <!-- Raw Response Warning -->
          <div v-if="store.result.raw_response" class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 mb-8 shadow-sm">
            <div class="flex items-start gap-4 mb-6">
              <AlertCircle class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 class="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Partial or Malformed Response</h2>
            </div>
            <p class="text-yellow-700 dark:text-yellow-300 mb-4">
              The application received a response from the API, but it could not be displayed because it did not match the expected format. 
              This can happen if the AI model deviates from the prompt's JSON structure instructions or if `maxOutputTokens` is too low.
            </p>
            <div v-if="store.result.error" class="mb-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Parsing Error</h3>
              <code class="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-2 rounded">
                {{ store.result.error }}
              </code>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Raw Response from API</h3>
              <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ store.result.raw_response }}</pre>
            </div>
          </div>

          <!-- Analysis -->
          <div v-if="analysisText" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analysis</h2>
            <div class="text-gray-700 dark:text-gray-300">
              <MarkdownRenderer :content="analysisText" />
            </div>
          </div>

          <!-- Clarifying Questions -->
          <div v-if="store.questions.length > 0" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Clarifying Questions from the AI</h2>
            <button 
              v-if="!store.showQuestionForm"
              @click="store.showQuestionForm = true" 
              class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Bot class="w-4 h-4" /> Answer Questions for Better Results
            </button>
            <form v-if="store.showQuestionForm" @submit.prevent="handleAnswerSubmit" class="space-y-4">
              <div v-for="(question, index) in store.questions" :key="index">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Q{{ index + 1 }}: {{ question }}
                </label>
                <textarea 
                  v-model="store.questionAnswers[question]"
                  placeholder="Your answer..." 
                  rows="2" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="flex gap-3">
                <button 
                  type="submit" 
                  :disabled="store.loading" 
                  class="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold flex items-center gap-2"
                >
                  <template v-if="store.loading">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                    Re-Enhancing...
                  </template>
                  <template v-else>
                    <Zap class="w-4 h-4" /> Re-Enhance with Answers
                  </template>
                </button>
                <button 
                  type="button" 
                  @click="store.showQuestionForm = false" 
                  class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold"
                >
                  Skip
                </button>
              </div>
            </form>
          </div>

          <!-- Enhanced Prompt Variants -->
          <div v-if="store.variants.length > 0">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Enhanced Prompt Variants</h2>
            <div class="grid gap-6">
              <PromptCard 
                v-for="(prompt, index) in store.variants"
                :key="prompt.id"
                :prompt="prompt"
                :index="index"
                :is-selected="store.selectedVariantsForComparison.includes(prompt.id)"
                :copied-id="store.copied"
                
                :is-editing="store.editingPromptId === prompt.id"
                :edited-content="store.editedPromptContent"
                :test-input="store.testInput"
                :test-output="store.testResults[prompt.id]"
                :is-testing="store.testingPromptIds.includes(prompt.id)"
                @copy="copyToClipboard"
                @toggle-comparison="store.toggleVariantForComparison"
                @setStartPrompt="(text,id)=>store.inputPrompt=text"
                @start-edit="handleStartEdit"
                @save-edit="handleSaveEdit"
                @cancel-edit="handleCancelEdit"
                @test-prompt="handleTestPrompt"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { promptVersions } from '../constants/appConstants'
import ProjectSidebar from '../components/ProjectSidebar.vue'
import ComparisonPanel from '../components/ComparisonPanel.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import PromptCard from '../components/PromptCard.vue'
import VariableEditor from '../components/VariableEditor.vue'
import {
  Bot, Settings, Sparkles, Code, Zap, AlertCircle, Copy, Check, History, 
  Sun, Moon, Star, Download, RotateCw, LayoutGrid, X, Plus, ChevronsUpDown, 
  TestTube2, GitFork, Play, ListTree, GitBranch, Search
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

const analysisText = computed(() => 
  store.result?.analysis || store.result?.initial_assessment || store.result?.architectural_analysis
)

const selectedVariantsForComparison = computed(() => 
  store.variants.filter((v) => store.selectedVariantsForComparison.includes(v.id))
)

const toggleDarkMode = () => {
  store.darkMode = !store.darkMode
  store.savePreferences()
}

const copyToClipboard = async (text, id) => {
  try {
    await navigator.clipboard.writeText(text)
    store.copied = id
    setTimeout(() => store.copied = '', 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    store.error = 'Failed to copy to clipboard.'
  }
}

const handleSubmit = async (event, isReEnhance = false) => {
  if (!store.apiKey.trim() || !store.inputPrompt.trim()) {
    store.error = 'API Key and an input prompt are required.'
    return
  }
  
  store.loading = true
  store.error = ''
  const promptWithVars = store.applyVariables(store.inputPrompt)
  
  if (!isReEnhance) {
    store.result = null
    store.selectedVariantsForComparison = []
    store.comparisonResults = []
    store.questionAnswers = {}
  }
  store.showQuestionForm = false

  try {
    const selectedPromptData = promptVersions[store.selectedVersion]
    let fullPrompt = `${selectedPromptData.prompt}\n\nORIGINAL PROMPT TO ENHANCE:\n"""\n${promptWithVars}\n"""`

    if (Object.keys(store.questionAnswers).length > 0 && isReEnhance) {
      fullPrompt += `\n\nADDITIONAL CONTEXT FROM USER ANSWERS:`
      Object.entries(store.questionAnswers).forEach(([question, answer]) => {
        if (answer.trim()) {
          fullPrompt += `\n- Question: "${question}"\n- Answer: "${answer}"\n`
        }
      })
    }
    
    fullPrompt += '\n\nPlease analyze and enhance this prompt according to the specifications above. Return only valid JSON.'

    const responseText = await store.executeGeminiPrompt(fullPrompt)
    const jsonResponse = store.parseGeminiResponse(responseText)
    store.result = jsonResponse
    
    const questions = jsonResponse.questions || jsonResponse.clarifying_questions || jsonResponse.clarification_needed
    if (questions && questions.length > 0 && !isReEnhance) {
      store.showQuestionForm = true
    }

    if (store.activeProject) {
      const historyItem = { 
        id: Date.now().toString(), 
        timestamp: new Date(), 
        inputPrompt: store.inputPrompt, 
        version: store.selectedVersion, 
        result: jsonResponse,
        questionAnswers: Object.keys(store.questionAnswers).length > 0 ? {...store.questionAnswers} : undefined
      }
      
      if (isReEnhance && store.promptHistory.length > 0) {
        const lastHistoryIndex = store.promptHistory.length - 1
        historyItem.questionAnswers = {...store.questionAnswers}
        historyItem.result = jsonResponse
        historyItem.reEnhanced = true
        historyItem.reEnhancedAt = new Date()
        store.updateHistory(historyItem)
      } else if (!isReEnhance) {
        store.addToHistory(historyItem)
      }
    }
  } catch (err) {
    console.error('API Error:', err)
    store.error = `Error: ${err.message || 'Failed to process your request. Please try again.'}`
  } finally {
    store.loading = false
  }
}

const handleAnswerSubmit = () => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  handleSubmit(submitEvent, true)
}

const handleRunComparison = async (testPrompt) => {
  store.isComparing = true
  const variantsToTest = store.variants
  const selected = variantsToTest.filter((v) => store.selectedVariantsForComparison.includes(v.id))

  store.comparisonResults = selected.map((v) => ({ variantId: v.id, output: '', loading: true }))

  const genAI = new GoogleGenerativeAI(store.apiKey)
  const model = genAI.getGenerativeModel({
    model: store.modelParams.model,
    generationConfig: { 
      temperature: store.modelParams.temperature, 
      maxOutputTokens: store.modelParams.maxOutputTokens 
    }
  })

  const promises = selected.map(async (variant) => {
    try {
      const fullPrompt = `${variant.prompt}\n\n---\n\nUSER REQUEST:\n${testPrompt}`
      const generationResult = await model.generateContent(fullPrompt)
      const responseText = await generationResult.response.text()
      return { variantId: variant.id, output: responseText, loading: false }
    } catch (error) {
      return { variantId: variant.id, output: '', error: error.message, loading: false }
    }
  })
  
  for (const promise of promises) {
    promise.then((res) => {
      store.comparisonResults = store.comparisonResults.map(r => 
        r.variantId === res.variantId ? res : r
      )
    })
  }
  
  await Promise.allSettled(promises)
  store.isComparing = false
}

const handleStartEdit = (promptId, content) => {
  store.editingPromptId = promptId
  store.editedPromptContent = content
}

const handleSaveEdit = (promptId, newContent) => {
  const variantIndex = store.variants.findIndex(v => v.id === promptId)
  if (variantIndex !== -1) {
    store.variants[variantIndex].prompt = newContent
    store.variants[variantIndex].title = `${store.variants[variantIndex].title} (Edited)`
  }
  store.editingPromptId = ''
  store.editedPromptContent = ''
}

const handleCancelEdit = () => {
  store.editingPromptId = ''
  store.editedPromptContent = ''
}

const handleTestPrompt = async (promptId, promptContent, testInput) => {
  if (!testInput.trim()) {
    store.error = 'Please enter test input'
    return
  }

  store.testingPromptIds = [...store.testingPromptIds, promptId]
  
  try {
    const genAI = new GoogleGenerativeAI(store.apiKey)
    const model = genAI.getGenerativeModel({
      model: store.modelParams.model,
      generationConfig: { 
        temperature: store.modelParams.temperature, 
        maxOutputTokens: store.modelParams.maxOutputTokens 
      }
    })

    const fullPrompt = `${promptContent}\n\n---\n\nUSER REQUEST:\n${testInput}`
    const generationResult = await model.generateContent(fullPrompt)
    const responseText = await generationResult.response.text()
    
    store.testResults = {
      ...store.testResults,
      [promptId]: {
        input: testInput,
        output: responseText,
        timestamp: new Date()
      }
    }
  } catch (error) {
    store.error = `Test failed: ${error.message}`
    store.testResults = {
      ...store.testResults,
      [promptId]: {
        input: testInput,
        output: '',
        error: error.message,
        timestamp: new Date()
      }
    }
  } finally {
    store.testingPromptIds = store.testingPromptIds.filter(id => id !== promptId)
  }
}
</script>