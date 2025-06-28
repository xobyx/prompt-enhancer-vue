<template>
  <div :class="[
    'min-h-screen transition-all duration-500 p-4 sm:p-6 lg:p-8',
    isDarkMode 
      ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950' 
      : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
  ]">
    

    <div class="max-w-7xl mx-auto">
      
      

      <!-- Input Section -->
      <div :class="[
        'rounded-3xl p-6 sm:p-8 mb-8 border shadow-2xl backdrop-blur-xl transition-all duration-500',
        isDarkMode 
          ? 'bg-white/10 border-white/20 shadow-purple-500/10' 
          : 'bg-white/70 border-white/60 shadow-black/10'
      ]">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h2 :class="[
            'text-2xl sm:text-3xl font-bold',
            isDarkMode ? 'text-white' : 'text-gray-900'
          ]">
            Input-Output Evidence
          </h2>
        </div>
        
        <!-- Evidence Pairs -->
        <div class="space-y-6">
          <div 
            v-for="(pair, index) in evidencePairs" 
            :key="index" 
            :class="[
              'rounded-2xl p-6 border transition-all duration-300 group hover:scale-[1.02] backdrop-blur-sm',
              isDarkMode 
                ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10' 
                : 'bg-white/60 border-white/40 hover:border-blue-200 hover:bg-white/80'
            ]"
          >
            <!-- Pair Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {{ index + 1 }}
                </div>
                <h3 :class="[
                  'text-lg font-semibold',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                ]">
                  Evidence {{ index + 1 }}
                </h3>
              </div>
              <button 
                v-if="evidencePairs.length > 1"
                @click="removePair(index)" 
                class="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 group-hover:scale-105 backdrop-blur-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Remove
              </button>
            </div>
            
            <!-- Input/Output Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="space-y-3">
                <label :class="[
                  'block text-sm font-medium uppercase tracking-wide',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  Input Given
                </label>
                <textarea 
                  v-model="pair.input" 
                  placeholder="e.g., Egypt, Sudan"
                  rows="3"
                  :class="[
                    'w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none backdrop-blur-sm',
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
                  ]"
                ></textarea>
              </div>
              <div class="space-y-3">
                <label :class="[
                  'block text-sm font-medium uppercase tracking-wide',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  Output Received
                </label>
                <textarea 
                  v-model="pair.output" 
                  placeholder="e.g., Sudan"
                  rows="3"
                  :class="[
                    'w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none backdrop-blur-sm',
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500'
                  ]"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            @click="addPair" 
            class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add More Evidence
          </button>
          <button 
            @click="reverseEngineerPrompt" 
            :disabled="isAnalyzing || !canAnalyze" 
            class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none disabled:opacity-50 backdrop-blur-sm"
          >
            <svg v-if="isAnalyzing" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {{ isAnalyzing ? 'Analyzing...' : 'Reverse Engineer Prompt' }}
          </button>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="analysisResult" class="space-y-8">
        <div class="text-center">
          <h2 :class="[
            'text-3xl sm:text-4xl font-bold mb-2',
            isDarkMode ? 'text-white' : 'text-gray-900'
          ]">
            <span class="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              🎯 Reverse Engineering Results
            </span>
          </h2>
        </div>

        <!-- Primary Prompt -->
        <div :class="[
          'rounded-3xl p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500',
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30' 
            : 'bg-gradient-to-br from-blue-100/80 to-purple-100/80 border-blue-200/60'
        ]">
          <div class="flex items-center gap-3 mb-6">
            <div class="text-4xl">🎯</div>
            <h3 :class="[
              'text-2xl font-bold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            ]">
              Most Likely Hidden Prompt
            </h3>
          </div>
          
          <div :class="[
            'rounded-2xl p-6 border backdrop-blur-sm',
            isDarkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/60 border-white/40'
          ]">
            <div :class="[
              'text-lg sm:text-xl font-medium mb-6 leading-relaxed p-4 rounded-xl border',
              isDarkMode 
                ? 'text-white bg-gradient-to-r from-blue-400/20 to-purple-400/20 border-blue-400/30' 
                : 'text-gray-900 bg-gradient-to-r from-blue-100/60 to-purple-100/60 border-blue-300/40'
            ]">
              "{{ analysisResult.primaryPrompt.text }}"
            </div>
            
            <!-- Confidence Bar -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span :class="[
                  'text-sm font-medium uppercase tracking-wide',
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                ]">
                  Confidence Level
                </span>
                <span :class="[
                  'text-sm font-bold',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                ]">
                  {{ analysisResult.primaryPrompt.confidence }}%
                </span>
              </div>
              <div :class="[
                'w-full rounded-full h-3 overflow-hidden',
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'
              ]">
                <div 
                  class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                  :style="{ width: analysisResult.primaryPrompt.confidence + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div :class="[
              'leading-relaxed',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            ]">
              <span :class="[
                'font-semibold',
                isDarkMode ? 'text-white' : 'text-gray-900'
              ]">
                Reasoning:
              </span> 
              {{ analysisResult.primaryPrompt.reasoning }}
            </div>
          </div>
        </div>

        <!-- Alternative Hypotheses -->
        <div :class="[
          'rounded-3xl p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500',
          isDarkMode 
            ? 'bg-gradient-to-br from-orange-500/20 to-pink-500/20 border-orange-500/30' 
            : 'bg-gradient-to-br from-orange-100/80 to-pink-100/80 border-orange-200/60'
        ]">
          <div class="flex items-center gap-3 mb-6">
            <div class="text-4xl">🔍</div>
            <h3 :class="[
              'text-2xl font-bold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            ]">
              Alternative Hypotheses
            </h3>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(alt, index) in analysisResult.alternatives" 
              :key="index" 
              :class="[
                'rounded-2xl p-6 border transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]',
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:border-orange-400/30' 
                  : 'bg-white/60 border-white/40 hover:border-orange-300/60'
              ]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {{ index + 2 }}
                  </div>
                  <span :class="[
                    'font-semibold',
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  ]">
                    Alternative #{{ index + 2 }}
                  </span>
                </div>
                <div :class="[
                  'px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm',
                  isDarkMode 
                    ? 'bg-orange-500/20 text-orange-300' 
                    : 'bg-orange-200/80 text-orange-700'
                ]">
                  {{ alt.confidence }}%
                </div>
              </div>
              <div :class="[
                'font-medium mb-3',
                isDarkMode ? 'text-orange-200' : 'text-orange-800'
              ]">
                "{{ alt.text }}"
              </div>
              <div :class="[
                'text-sm',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              ]">
                {{ alt.reasoning }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pattern Analysis -->
        <div :class="[
          'rounded-3xl p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500',
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30' 
            : 'bg-gradient-to-br from-purple-100/80 to-indigo-100/80 border-purple-200/60'
        ]">
          <div class="flex items-center gap-3 mb-6">
            <div class="text-4xl">📊</div>
            <h3 :class="[
              'text-2xl font-bold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            ]">
              Pattern Analysis
            </h3>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Detected Patterns -->
            <div :class="[
              'rounded-2xl p-6 border backdrop-blur-sm',
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/60 border-white/40'
            ]">
              <h4 :class="[
                'text-lg font-semibold mb-4 flex items-center gap-2',
                isDarkMode ? 'text-white' : 'text-gray-900'
              ]">
                <div class="w-6 h-6 bg-green-500 rounded-full shadow-lg"></div>
                Detected Patterns
              </h4>
              <div class="space-y-2">
                <div 
                  v-for="pattern in analysisResult.patterns.detected" 
                  :key="pattern" 
                  :class="[
                    'px-3 py-2 rounded-lg text-sm border backdrop-blur-sm',
                    isDarkMode 
                      ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                      : 'bg-green-100/80 text-green-700 border-green-300/60'
                  ]"
                >
                  {{ pattern }}
                </div>
              </div>
            </div>
            
            <!-- Transformation Type -->
            <div :class="[
              'rounded-2xl p-6 border backdrop-blur-sm',
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/60 border-white/40'
            ]">
              <h4 :class="[
                'text-lg font-semibold mb-4 flex items-center gap-2',
                isDarkMode ? 'text-white' : 'text-gray-900'
              ]">
                <div class="w-6 h-6 bg-blue-500 rounded-full shadow-lg"></div>
                Transformation Type
              </h4>
              <div class="mb-4">
                <div class="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide shadow-lg">
                  {{ analysisResult.patterns.transformationType }}
                </div>
              </div>
              <p :class="[
                'text-sm leading-relaxed',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              ]">
                {{ analysisResult.patterns.transformationDescription }}
              </p>
            </div>
            
            <!-- Input Relationships -->
            <div :class="[
              'rounded-2xl p-6 border backdrop-blur-sm',
              isDarkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/60 border-white/40'
            ]">
              <h4 :class="[
                'text-lg font-semibold mb-4 flex items-center gap-2',
                isDarkMode ? 'text-white' : 'text-gray-900'
              ]">
                <div class="w-6 h-6 bg-purple-500 rounded-full shadow-lg"></div>
                Input Relationships
              </h4>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="rel in analysisResult.patterns.inputRelationships" 
                  :key="rel" 
                  :class="[
                    'px-3 py-1 rounded-full text-sm border backdrop-blur-sm',
                    isDarkMode 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                      : 'bg-purple-100/80 text-purple-700 border-purple-300/60'
                  ]"
                >
                  {{ rel }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Tests -->
        <div :class="[
          'rounded-3xl p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500',
          isDarkMode 
            ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-500/30' 
            : 'bg-gradient-to-br from-teal-100/80 to-cyan-100/80 border-teal-200/60'
        ]">
          <div class="flex items-center gap-3 mb-6">
            <div class="text-4xl">🧪</div>
            <h3 :class="[
              'text-2xl font-bold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            ]">
              Verification Tests
            </h3>
          </div>
          
          <div :class="[
            'rounded-2xl p-6 border mb-6 backdrop-blur-sm',
            isDarkMode 
              ? 'bg-teal-500/10 border-teal-500/30' 
              : 'bg-teal-100/80 border-teal-300/60'
          ]">
            <p :class="[
              'font-medium text-lg',
              isDarkMode ? 'text-teal-200' : 'text-teal-800'
            ]">
              Test the discovered prompt with new inputs:
            </p>
          </div>
          
          <div class="space-y-4">
            <div 
              v-for="(test, index) in analysisResult.verificationTests" 
              :key="index" 
              :class="[
                'rounded-2xl p-6 border transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]',
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:border-teal-400/30' 
                  : 'bg-white/60 border-white/40 hover:border-teal-300/60'
              ]"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div :class="[
                    'font-semibold mb-2',
                    isDarkMode ? 'text-teal-300' : 'text-teal-700'
                  ]">
                    Test Input:
                  </div>
                  <div :class="[
                    'px-3 py-2 rounded-lg backdrop-blur-sm',
                    isDarkMode 
                      ? 'text-white bg-teal-500/20' 
                      : 'text-gray-900 bg-teal-100/80'
                  ]">
                    {{ test.input }}
                  </div>
                </div>
                <div>
                  <div :class="[
                    'font-semibold mb-2',
                    isDarkMode ? 'text-cyan-300' : 'text-cyan-700'
                  ]">
                    Predicted Output:
                  </div>
                  <div :class="[
                    'px-3 py-2 rounded-lg backdrop-blur-sm',
                    isDarkMode 
                      ? 'text-white bg-cyan-500/20' 
                      : 'text-gray-900 bg-cyan-100/80'
                  ]">
                    {{ test.predictedOutput }}
                  </div>
                </div>
                <div>
                  <div :class="[
                    'font-semibold mb-2',
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  ]">
                    Reasoning:
                  </div>
                  <div :class="[
                    'text-sm',
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  ]">
                    {{ test.reasoning }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Methodology -->
        <div :class="[
          'rounded-3xl p-8 border shadow-2xl backdrop-blur-xl transition-all duration-500']">
          

        
          <div class="flex items-center gap-3 mb-6">
            <div class="text-3xl">🔬</div>
            <h3 class="text-2xl font-bold text-black">Analysis Methodology</h3>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 class="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <div class="w-6 h-6 bg-indigo-500 rounded-full"></div>
                Approach Used
              </h4>
              <p class="text-black-300 text-sm leading-relaxed">{{ analysisResult.methodology.approach }}</p>
            </div>
            
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 class="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <div class="w-6 h-6 bg-emerald-500 rounded-full"></div>
                Key Insights
              </h4>
              <ul class="space-y-2">
                <li 
                  v-for="insight in analysisResult.methodology.keyInsights" 
                  :key="insight"
                  class="text-gray-300 text-sm leading-relaxed flex items-start gap-2"
                >
                  <div class="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  {{ insight }}
                </li>
              </ul>
            </div>
            
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 class="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                <div class="w-6 h-6 bg-yellow-500 rounded-full"></div>
                Limitations
              </h4>
              <ul class="space-y-2">
                <li 
                  v-for="limitation in analysisResult.methodology.limitations" 
                  :key="limitation"
                  class="text-gray-300 text-sm leading-relaxed flex items-start gap-2"
                >
                  <div class="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  {{ limitation }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-3xl">❌</div>
          <h3 class="text-2xl font-bold text-white">Analysis Error</h3>
        </div>
        <div class="bg-red-500/20 text-red-200 p-4 rounded-lg border border-red-500/30">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
// Types
interface EvidencePair {
  input: string
  output: string
}

interface PromptHypothesis {
  text: string
  confidence: number
  reasoning: string
}

interface VerificationTest {
  input: string
  predictedOutput: string
  reasoning: string
}

interface ReverseEngineeringResult {
  primaryPrompt: PromptHypothesis
  alternatives: PromptHypothesis[]
  patterns: {
    detected: string[]
    transformationType: string
    transformationDescription: string
    inputRelationships: string[]
  }
  verificationTests: VerificationTest[]
  methodology: {
    approach: string
    keyInsights: string[]
    limitations: string[]
  }
  metadata: {
    analyzedAt: string
    evidenceCount: number
    analysisMethod: string
  }
}
const store = useAppStore()
const isDarkMode = computed(() => store.darkMode)
// Reactive state
const evidencePairs = ref<EvidencePair[]>([

])

const analysisResult = ref<ReverseEngineeringResult | null>(null)
const isAnalyzing = ref(false)
const error = ref<string | null>(null)

// Hardcoded API key (replace with your actual key)
const GEMINI_API_KEY = 'AIzaSyDaKIVkGzYb5-VwG5SemKMQbNxngQah94A'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// Computed properties
const canAnalyze = computed(() => {
  return evidencePairs.value.some(pair => pair.input.trim() && pair.output.trim())
})

// Methods
const addPair = () => {
  evidencePairs.value.push({ input: '', output: '' })
}

const removePair = (index: number) => {
  evidencePairs.value.splice(index, 1)
}

const reverseEngineerPrompt = async () => {
  if (!canAnalyze.value) return

  isAnalyzing.value = true
  error.value = null

  try {
    const validPairs = evidencePairs.value.filter(pair => 
      pair.input.trim() && pair.output.trim()
    )

    const reverseEngineeringPrompt = createReverseEngineeringPrompt(validPairs)
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: reverseEngineeringPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 30000,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text
      
      try {
        // Extract JSON from the response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                         responseText.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0]
          analysisResult.value = JSON.parse(jsonStr)
        } else {
          throw new Error('No valid JSON found in response')
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        error.value = 'Failed to parse analysis results. Please try again.'
      }
    } else {
      throw new Error('Invalid response structure from Gemini API')
    }

  } catch (err) {
    console.error('Analysis error:', err)
    error.value = err instanceof Error ? err.message : 'An unknown error occurred'
  } finally {
    isAnalyzing.value = false
  }
}

const createReverseEngineeringPrompt = (pairs: EvidencePair[]): string => {
  const evidenceText = pairs.map((pair, index) => 
    `Evidence ${index + 1}:\n  Input: "${pair.input}"\n  Output: "${pair.output}"`
  ).join('\n\n')

  return `You are a detective analyzing evidence to reverse-engineer an unknown prompt. Given these input-output pairs, determine what the original hidden prompt was.

EVIDENCE:
${evidenceText}

Your task is to deduce the most likely hidden prompt that would produce these exact outputs from these inputs. Think like a detective:

1. What patterns do you see in the transformations?
2. What kind of question or instruction would produce these results?
3. What relationships exist between inputs and outputs?
4. What domain knowledge might be required?

Return your analysis as a JSON object with this exact structure:

\`\`\`json
{
  "primaryPrompt": {
    "text": "The most likely hidden prompt (e.g., 'Which country is larger, A or B?')",
    "confidence": 95,
    "reasoning": "Detailed explanation of why this is the most likely prompt"
  },
  "alternatives": [
    {
      "text": "Alternative prompt hypothesis",
      "confidence": 75,
      "reasoning": "Why this could also be the hidden prompt"
    },
    {
      "text": "Another alternative",
      "confidence": 60,
      "reasoning": "Less likely but possible explanation"
    }
  ],
  "patterns": {
    "detected": [
      "Pattern 1 observed in the data",
      "Pattern 2 observed in the data"
    ],
    "transformationType": "Classification/Comparison/Selection/Calculation/etc.",
    "transformationDescription": "Detailed description of how inputs become outputs",
    "inputRelationships": ["Relationship 1", "Relationship 2"]
  },
  "verificationTests": [
    {
      "input": "Test input based on discovered pattern",
      "predictedOutput": "What the output should be",
      "reasoning": "Why this prediction makes sense"
    }
  ],
  "methodology": {
    "approach": "Description of how you analyzed the evidence",
    "keyInsights": [
      "Key insight 1 from analysis",
      "Key insight 2 from analysis"
    ],
    "limitations": [
      "Limitation 1 of this analysis",
      "Limitation 2 of this analysis"
    ]
  },
  "metadata": {
    "analyzedAt": "${new Date().toISOString()}",
    "evidenceCount": ${pairs.length},
    "analysisMethod": "Pattern Recognition & Logical Deduction"
  }
}
\`\`\`

Think step by step:
1. Look for mathematical relationships, comparisons, selections, transformations
2. Consider domain-specific knowledge (geography, science, etc.)
3. Analyze the structure and format of inputs vs outputs
4. Consider the simplest explanation that fits all evidence
5. Think about what kind of AI task this represents

Be thorough, logical, and provide multiple hypotheses ranked by confidence. Return only the JSON, no additional text.`
}
</script>