<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Send, Sparkles, Settings, Copy, Check, AlertCircle, Wand2, Target, Lightbulb, Zap } from 'lucide-vue-next'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

// Types
interface AIOption {
  value: string
  label: string
}

interface StyleOption {
  value: 'DETAIL' | 'BASIC'
  label: string
}

interface OptimizationResult {
  optimized_prompt: string
  key_improvements: string[]
  techniques_applied: string[]
  pro_tip?: string
  complexity_level: 'simple' | 'complex'
  estimated_effectiveness: number
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface GeminiError {
  error?: {
    message: string
  }
}

// State management
const userInput = ref<string>('')
const targetAI = ref<string>('gemini')
const promptStyle = ref<'DETAIL' | 'BASIC'>('DETAIL')
const apiKey = ref<string>('')
const showWelcome = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const result = ref<OptimizationResult | null>(null)
const error = ref<string>('')
const copied = ref<boolean>(false)
const showSettings = ref<boolean>(false)

// Computed properties
const isValidInput = computed<boolean>(() => {
  return userInput.value.trim().length > 0 && apiKey.value.trim().length > 0
})

const aiOptions: AIOption[] = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'other', label: 'Other' }
]

const styleOptions: StyleOption[] = [
  { value: 'DETAIL', label: 'DETAIL (with clarifying questions)' },
  { value: 'BASIC', label: 'BASIC (quick optimization)' }
]

// Welcome message
const welcomeMessage: string = `Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precision-crafted prompts that deliver better results.

**What I need to know:**
- **Target AI:** ChatGPT, Claude, Gemini, or Other
- **Prompt Style:** DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

**Examples:**
- "DETAIL using ChatGPT — Write me a marketing email"
- "BASIC using Claude — Help with my resume"

Just share your rough prompt and I'll handle the optimization!`

// Core Lyra system prompt
const getLyraSystemPrompt = (): string => {
  return `You are Lyra, a master-level AI prompt optimization specialist. Your mission: transform any user input into precision-crafted prompts that unlock AI's full potential across all platforms.

## THE 4-D METHODOLOGY

### 1. DECONSTRUCT
- Extract core intent, key entities, and context
- Identify output requirements and constraints
- Map what's provided vs. what's missing

### 2. DIAGNOSE
- Audit for clarity gaps and ambiguity
- Check specificity and completeness
- Assess structure and complexity needs

### 3. DEVELOP
- Select optimal techniques based on request type:
  - **Creative** → Multi-perspective + tone emphasis
  - **Technical** → Constraint-based + precision focus
  - **Educational** → Few-shot examples + clear structure
  - **Complex** → Chain-of-thought + systematic frameworks
- Assign appropriate AI role/expertise
- Enhance context and implement logical structure

### 4. DELIVER
- Construct optimized prompt
- Format based on complexity
- Provide implementation guidance

## OPTIMIZATION TECHNIQUES

**Foundation:** Role assignment, context layering, output specs, task decomposition

**Advanced:** Chain-of-thought, few-shot learning, multi-perspective analysis, constraint optimization

**Platform Notes:**
- **ChatGPT/GPT-4:** Structured sections, conversation starters
- **Claude:** Longer context, reasoning frameworks
- **Gemini:** Creative tasks, comparative analysis
- **Others:** Apply universal best practices

## OPERATING MODES

**DETAIL MODE:** 
- Gather context with smart defaults
- Ask 2-3 targeted clarifying questions
- Provide comprehensive optimization

**BASIC MODE:**
- Quick fix primary issues
- Apply core techniques only
- Deliver ready-to-use prompt

Target AI: ${targetAI.value}
Prompt Style: ${promptStyle.value}

IMPORTANT: You must respond with a valid JSON object in the following format:
{
  "optimized_prompt": "The improved prompt text here",
  "key_improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "techniques_applied": ["Technique 1", "Technique 2"],
  "pro_tip": "Optional usage guidance",
  "complexity_level": "simple" or "complex",
  "estimated_effectiveness": 85
}

Now optimize the following user input:`
}

// Gemini API call
const callGeminiAPI = async (prompt: string): Promise<string> => {
  if (!apiKey.value) {
    throw new Error('API key is required')
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.value}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    const errorData: GeminiError = await response.json()
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
  }

  const data: GeminiResponse = await response.json()
  return data.candidates[0].content.parts[0].text
}

// Parse JSON response
const parseJsonResponse = (text: string): OptimizationResult => {
  try {
    // Clean up the response text - remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleanText)
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON. Please try again.')
  }
}

// Main optimization function
const optimizePrompt = async (): Promise<void> => {
  if (!isValidInput.value) return

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const systemPrompt = getLyraSystemPrompt()
    const fullPrompt = `${systemPrompt}\n\nUser Input: "${userInput.value}"`
    
    const rawResponse = await callGeminiAPI(fullPrompt)
    const parsedResult = parseJsonResponse(rawResponse)
    result.value = parsedResult
    showWelcome.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred'
    console.error('Error:', err)
  } finally {
    isLoading.value = false
  }
}

// Copy to clipboard
const copyToClipboard = async (): Promise<void> => {
  if (!result.value) return
  
  try {
    await navigator.clipboard.writeText(result.value.optimized_prompt)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Reset function
const reset = (): void => {
  userInput.value = ''
  result.value = null
  error.value = ''
  showWelcome.value = true
}

// Load API key from localStorage
onMounted(() => {
  const savedApiKey = localStorage.getItem('lyra-api-key')
  if (savedApiKey) {
    apiKey.value = savedApiKey
  }
})

// Save API key to localStorage
const saveApiKey = (): void => {
  localStorage.setItem('lyra-api-key', apiKey.value)
  showSettings.value = false
}

// Get effectiveness color
const getEffectivenessColor = (score: number): string => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

// Get complexity badge style
const getComplexityBadge = (level: string): string => {
  return level === 'complex' 
    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Sparkles class="w-8 h-8 text-purple-400" />
          <h1 class="text-4xl font-bold text-white">Lyra</h1>
        </div>
        <p class="text-purple-200 text-lg">AI Prompt Optimization Specialist</p>
      </div>

      <!-- Settings Button -->
      <div class="flex justify-end mb-4">
        <button 
          @click="showSettings = !showSettings"
          class="p-2 text-purple-300 hover:text-white transition-colors"
        >
          <Settings class="w-5 h-5" />
        </button>
      </div>

      <!-- Settings Panel -->
      <div v-if="showSettings" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/20">
        <h3 class="text-xl font-semibold text-white mb-4">Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-purple-200 mb-2">Gemini API Key</label>
            <input 
              v-model="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              class="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
            <p class="text-purple-300 text-sm mt-1">Get your API key from Google AI Studio</p>
          </div>
          <button 
            @click="saveApiKey"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      <!-- Welcome Message -->
      <div v-if="showWelcome" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/20">
        <MarkdownRenderer :content="welcomeMessage" />
      </div>

      <!-- Main Interface -->
      <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20 mb-6">
        <!-- Configuration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-purple-200 mb-2">Target AI Platform</label>
            <select 
              v-model="targetAI"
              class="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option v-for="option in aiOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-purple-200 mb-2">Optimization Style</label>
            <select 
              v-model="promptStyle"
              class="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              <option v-for="option in styleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Input -->
        <div class="mb-6">
          <label class="block text-purple-200 mb-2">Your Prompt (to be optimized)</label>
          <textarea 
            v-model="userInput"
            placeholder="Enter your rough prompt here... e.g., 'Write me a marketing email for my new product'"
            class="w-full h-32 p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 resize-none"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-3">
          <button 
            @click="optimizePrompt"
            :disabled="!isValidInput || isLoading"
            class="flex-1 flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors"
          >
            <Send class="w-5 h-5" />
            {{ isLoading ? 'Optimizing...' : 'Optimize Prompt' }}
          </button>
          <button 
            @click="reset"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
        <div class="flex items-center gap-2 text-red-200">
          <AlertCircle class="w-5 h-5" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Results Display -->
      <div v-if="result" class="space-y-6">
        <!-- Main Optimized Prompt -->
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <Wand2 class="w-6 h-6 text-purple-400" />
              <h3 class="text-xl font-semibold text-white">Optimized Prompt</h3>
            </div>
            <button 
              @click="copyToClipboard"
              class="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              <component :is="copied ? Check : Copy" class="w-4 h-4" />
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <div class="bg-white/5 border border-purple-500/30 rounded-lg p-4">
            <MarkdownRenderer :content="result.optimized_prompt" />
          </div>
        </div>

        <!-- Analysis Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Key Improvements -->
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <div class="flex items-center gap-2 mb-4">
              <Target class="w-5 h-5 text-green-400" />
              <h4 class="text-lg font-semibold text-white">Key Improvements</h4>
            </div>
            <ul class="space-y-2">
              <li v-for="improvement in result.key_improvements" :key="improvement" class="flex items-start gap-2">
                <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span class="text-purple-100">{{ improvement }}</span>
              </li>
            </ul>
          </div>

          <!-- Techniques Applied -->
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <div class="flex items-center gap-2 mb-4">
              <Zap class="w-5 h-5 text-yellow-400" />
              <h4 class="text-lg font-semibold text-white">Techniques Applied</h4>
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="technique in result.techniques_applied" 
                :key="technique"
                class="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm border border-yellow-500/30"
              >
                {{ technique }}
              </span>
            </div>
          </div>
        </div>

        <!-- Metrics and Pro Tip -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Metrics -->
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <h4 class="text-lg font-semibold text-white mb-4">Analysis Metrics</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-purple-200">Complexity Level</span>
                <span :class="getComplexityBadge(result.complexity_level)" class="px-2 py-1 rounded-full text-sm border capitalize">
                  {{ result.complexity_level }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-purple-200">Effectiveness Score</span>
                <span :class="getEffectivenessColor(result.estimated_effectiveness)" class="font-semibold">
                  {{ result.estimated_effectiveness }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Pro Tip -->
          <div v-if="result.pro_tip" class="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <div class="flex items-center gap-2 mb-3">
              <Lightbulb class="w-5 h-5 text-orange-400" />
              <h4 class="text-lg font-semibold text-white">Pro Tip</h4>
            </div>
            <p class="text-purple-100">{{ result.pro_tip }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-purple-300 text-sm">
        <p>Powered by Gemini Flash API • Built with Vue 3 + TypeScript</p>
      </div>
    </div>
  </div>
</template>