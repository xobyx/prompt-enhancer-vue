<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          AI Prompt Reverse Engineer
        </h1>
        <p class="text-gray-600 text-lg">
          Analyze AI outputs to reconstruct their original prompts
        </p>
      </div>

      <!-- API Configuration -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Gemini API Configuration
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              id="apiKey"
              v-model="apiConfig.apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label for="model" class="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              id="model"
              v-model="apiConfig.model"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2">
          <div class="flex items-center">
            <div :class="['w-3 h-3 rounded-full mr-2', apiStatusClasses]"></div>
            <span class="text-sm text-gray-600">{{ apiStatusText }}</span>
          </div>
          <button
            @click="testApiConnection"
            :disabled="!apiConfig.apiKey || isLoading"
            class="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Connection
          </button>
        </div>
      </div>

      <!-- Main Interface -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Input Section -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Configuration & Input
          </h2>
          
          <!-- Template Selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label for="mainTemplate" class="block text-sm font-medium text-gray-700 mb-2">
                Analysis Template
              </label>
              <select
                id="mainTemplate"
                v-model="selectedTemplate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CORE_INFERENCE">Core Inference (Versatile)</option>
                <option value="STRUCTURED_ANALYSIS">Structured Analysis (Detailed)</option>
                <option value="TECHNICAL_ANALYSIS">Technical Content</option>
                <option value="CREATIVE_ANALYSIS">Creative Content</option>
                <option value="PROFESSIONAL_ANALYSIS">Business/Professional</option>
                <option value="COMPREHENSIVE_ANALYSIS">Comprehensive Analysis</option>
              </select>
            </div>
             <div>
              <label for="specializedTemplate" class="block text-sm font-medium text-gray-700 mb-2">
                Specialized Templates
              </label>
              <select
                id="specializedTemplate"
                v-model="specializedTemplate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None (Use main template)</option>
                <option value="API_DOCUMENTATION">API Documentation</option>
                <option value="MARKETING_COPY">Marketing Copy</option>
                <option value="EDUCATIONAL_CONTENT">Educational Content</option>
                <option value="CODE_DOCUMENTATION">Code Documentation</option>
              </select>
            </div>
          </div>

          <!-- Customization Options -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label for="domain" class="block text-sm font-medium text-gray-700 mb-2">Domain</label>
              <input
                id="domain"
                v-model="options.domain"
                type="text"
                placeholder="e.g., healthcare, finance"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="complexity" class="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
              <select
                id="complexity"
                v-model="options.complexity"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Default</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label for="focus" class="block text-sm font-medium text-gray-700 mb-2">Focus</label>
              <select
                id="focus"
                v-model="options.focus"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Default</option>
                <option value="accuracy">Accuracy</option>
                <option value="creativity">Creativity</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label for="outputFormat" class="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select
                id="outputFormat"
                v-model="options.outputFormat"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="prompt-only">Prompt Only</option>
                <option value="structured">Structured</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          <!-- Advanced API Options -->
          <div class="mb-6 border-t pt-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3">API Parameters</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="temperature" class="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                <input
                  id="temperature"
                  v-model.number="apiConfig.temperature"
                  type="range" min="0" max="2" step="0.1" class="w-full"
                />
                <span class="text-xs text-gray-500">{{ apiConfig.temperature.toFixed(1) }}</span>
              </div>
              <div>
                <label for="maxTokens" class="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                <input
                  id="maxTokens"
                  v-model.number="apiConfig.maxTokens"
                  type="number" min="100" max="8192" class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label for="topP" class="block text-sm font-medium text-gray-700 mb-1">Top P</label>
                <input
                  id="topP"
                  v-model.number="apiConfig.topP"
                  type="range" min="0" max="1" step="0.05" class="w-full"
                />
                <span class="text-xs text-gray-500">{{ apiConfig.topP.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Input Text -->
          <div class="mb-6">
            <label for="inputText" class="block text-sm font-medium text-gray-700 mb-2">AI Output to Analyze</label>
            <textarea
              id="inputText"
              v-model="inputText"
              rows="8"
              placeholder="Paste the AI-generated content you want to reverse engineer..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="generatePrompt"
              :disabled="!inputText.trim() || !apiConfig.apiKey || isLoading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Generating...' : 'Generate Reverse Prompt' }}
            </button>
            <button
              @click="validatePrompt"
              :disabled="!generatedPrompt || isLoading"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Validate
            </button>
          </div>
        </div>

        <!-- Results Section -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Generated Results</h2>
          
          <!-- Error Display -->
          <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700 break-words">{{ error }}</div>
              </div>
            </div>
          </div>

          <!-- Usage Stats -->
          <div v-if="usageStats" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <div class="font-medium">API Usage</div>
            <div class="mt-1 space-x-4 flex">
              <span>Prompt: {{ usageStats.promptTokens }}</span>
              <span>Completion: {{ usageStats.completionTokens }}</span>
              <span>Total: {{ usageStats.totalTokens }}</span>
            </div>
          </div>
          
          <!-- Generated Prompt Display -->
          <div class="mb-6">
             <label for="generatedPrompt" class="block text-sm font-medium text-gray-700 mb-2">Generated Reverse Prompt</label>
            <div class="relative">
              <textarea
                v-if="options.outputFormat=='prompt-only'"
                id="generatedPrompt"
                v-model="generatedPrompt"
                rows="12"
                readonly
                placeholder="Generated prompt will appear here..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-y focus:outline-none"
              ></textarea>
              <div v-else class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                <MarkdownRenderer :content="generatedPrompt"/>
              </div>
              <button
                v-if="generatedPrompt && options.outputFormat=='prompt-only'"
                @click="copyToClipboard(generatedPrompt)"
                class="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Copy to clipboard"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </button>
            </div>
          </div>

          <!-- Validation Results -->
          <div v-if="validationResults" class="mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Validation Results</h3>
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Quality Score</span>
                <span :class="['text-lg font-bold', scoreColorClass]">{{ validationResults.score }}/100</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div :class="['h-2.5 rounded-full transition-all duration-500', scoreBarColorClass]" :style="{ width: validationResults.score + '%' }"></div>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                <ul class="space-y-1">
                  <li v-for="(item, i) in validationResults.feedback" :key="`fb-${i}`" class="text-sm text-green-700 flex items-start">
                    <span class="mr-2 text-green-500">✓</span><span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">Improvements</h4>
                <ul class="space-y-1">
                  <li v-for="(item, i) in validationResults.improvements" :key="`imp-${i}`" class="text-sm text-amber-700 flex items-start">
                    <span class="mr-2 text-amber-500">→</span><span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Template Preview -->
          <div class="border-t pt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Selected Template Preview</h3>
            <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
              <pre class="whitespace-pre-wrap">{{ templatePreview }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button @click="loadExample('technical')" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-left">
            <div class="font-medium text-gray-900">Load Technical Example</div>
            <div class="text-sm text-gray-500">API documentation sample</div>
          </button>
          <button @click="loadExample('creative')" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-left">
            <div class="font-medium text-gray-900">Load Creative Example</div>
            <div class="text-sm text-gray-500">Marketing copy sample</div>
          </button>
          <button @click="clearAll" class="p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-left">
            <div class="font-medium text-red-800">Clear All</div>
            <div class="text-sm text-red-600">Reset form and results</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { REVERSE_ENGINEERING_PROMPTS, SPECIALIZED_TEMPLATES, EXAMPLES } from '../constants/prompts'; // Assumes prompts are in a separate file
import MarkdownRenderer from './MarkdownRenderer.vue'
// --- TYPE DEFINITIONS ---
// (For a larger app, move these to a separate types.ts file)
type ApiStatus = 'disconnected' | 'connected' | 'error';
type TemplateKey = keyof typeof REVERSE_ENGINEERING_PROMPTS;
type SpecializedTemplateKey = keyof typeof SPECIALIZED_TEMPLATES;
type ExampleKey = keyof typeof EXAMPLES;

interface ApiConfig {
  apiKey: string;
  model: 'gemini-2.5-flash' |'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-pro';
  temperature: number;
  maxTokens: number;
  topP: number;
}

interface Options {
  domain: string;
  complexity: '' | 'basic' | 'intermediate' | 'advanced';
  focus: '' | 'accuracy' | 'creativity' | 'technical' | 'business';
  outputFormat: 'prompt-only' | 'structured' | 'detailed';
}

interface ValidationResults {
  score: number;
  feedback: string[];
  improvements: string[];
}

interface UsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface GeminiGenerateContentResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}


// --- API CLIENT ---
// (For a larger app, move to its own api/gemini.ts file)
class GeminiAPIClient {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(private apiKey: string, private model: string) {}

  async generateContent(prompt: string, options: Partial<ApiConfig>): Promise<{ content: string; usage: UsageStats | null }> {
    const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature,
          topP: options.topP,
          maxOutputTokens: options.maxTokens,
          candidateCount: 1,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const candidate = data.candidates?.[0];

    if (!candidate) throw new Error('No content generated by the API.');
    if (candidate.finishReason === 'SAFETY') throw new Error('Content was blocked due to safety settings.');
    
    const content = candidate.content?.parts?.[0]?.text;
    if (!content) throw new Error('No text content found in the API response.');

    const usage = data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata.totalTokenCount ?? 0,
        }
      : null;

    return { content, usage };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.generateContent("Test connection. Respond with 'OK'.", { maxTokens: 10 });
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}


// --- COMPONENT STATE ---
const selectedTemplate = ref<TemplateKey>('CORE_INFERENCE');
const specializedTemplate = ref<SpecializedTemplateKey | ''>('');
const inputText = ref<string>('');
const generatedPrompt = ref<string>('');
const validationResults = ref<ValidationResults | null>(null);
const isLoading = ref<boolean>(false);
const error = ref<string>('');
const apiStatus = ref<ApiStatus>('disconnected');
const usageStats = ref<UsageStats | null>(null);

const options = reactive<Options>({
  domain: '',
  complexity: '',
  focus: '',
  outputFormat: 'prompt-only',
});

const apiConfig = reactive<ApiConfig>({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', // Load from .env if available
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.95,
});


// --- COMPUTED PROPERTIES ---
const apiStatusText = computed(() => {
  const map: Record<ApiStatus, string> = {
    connected: 'API Connected',
    error: 'Connection Failed',
    disconnected: 'Not Connected',
  };
  return map[apiStatus.value];
});

const apiStatusClasses = computed(() => {
  const map: Record<ApiStatus, string> = {
    connected: 'bg-green-500',
    error: 'bg-red-500',
    disconnected: 'bg-gray-400',
  };
  return map[apiStatus.value];
});

const templatePreview = computed(() => {
  const key = specializedTemplate.value || selectedTemplate.value;
  const template = specializedTemplate.value
    ? SPECIALIZED_TEMPLATES[specializedTemplate.value]
    : REVERSE_ENGINEERING_PROMPTS[selectedTemplate.value];
  return template ? template.substring(0, 300) + '...' : 'No template selected.';
});

const scoreColorClass = computed(() => {
  if (!validationResults.value) return '';
  const score = validationResults.value.score;
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
});

const scoreBarColorClass = computed(() => {
  if (!validationResults.value) return 'bg-gray-200';
  const score = validationResults.value.score;
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
});


// --- METHODS ---
watch(() => apiConfig.apiKey, () => {
  apiStatus.value = 'disconnected';
  error.value = '';
});

const testApiConnection = async (): Promise<void> => {
  if (!apiConfig.apiKey) return;
  isLoading.value = true;
  error.value = '';
  
  const client = new GeminiAPIClient(apiConfig.apiKey, apiConfig.model);
  const result = await client.testConnection();
  
  if (result.success) {
    apiStatus.value = 'connected';
  } else {
    apiStatus.value = 'error';
    error.value = result.error ?? 'An unknown error occurred.';
  }
  isLoading.value = false;
};

const customizePrompt = (basePrompt: string, outputText: string, opts: Options): string => {
  let customized = basePrompt.replace('{{OUTPUT_TEXT}}', outputText);
  if (opts.domain) customized += `\n\nDOMAIN CONTEXT: The analysis should consider the domain of "${opts.domain}".`;
  if (opts.complexity) customized += `\nCOMPLEXITY LEVEL: Target a "${opts.complexity}" level of analysis.`;
  if (opts.focus) customized += `\nPRIMARY FOCUS: The reverse engineering should prioritize "${opts.focus}".`;
  return customized;
};

const generatePrompt = async (): Promise<void> => {
  if (!inputText.value.trim() || !apiConfig.apiKey) return;

  isLoading.value = true;
  error.value = '';
  generatedPrompt.value = '';
  validationResults.value = null;
  usageStats.value = null;

  try {
    const client = new GeminiAPIClient(apiConfig.apiKey, apiConfig.model);
    const baseTemplate = specializedTemplate.value
      ? SPECIALIZED_TEMPLATES[specializedTemplate.value]
      : REVERSE_ENGINEERING_PROMPTS[selectedTemplate.value];
    
    const finalPrompt = customizePrompt(baseTemplate, inputText.value, options);
    
    const result = await client.generateContent(finalPrompt, apiConfig);
    generatedPrompt.value = result.content;
    usageStats.value = result.usage;

  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'An unknown error occurred during generation.';
  } finally {
    isLoading.value = false;
  }
};

const validatePrompt = (): void => {
  if (!generatedPrompt.value) return;

  const feedback: string[] = [];
  const improvements: string[] = [];
  let score = 0;

  // Basic checks (can be expanded)
  if (generatedPrompt.value.length > 50) { score += 20; feedback.push('Good length.'); } else { improvements.push('Prompt may be too short.'); }
  if (/role|persona|act as/i.test(generatedPrompt.value)) { score += 15; feedback.push('Clear role/persona defined.'); } else { improvements.push('Consider defining a role/persona.'); }
  if (/format|structure|style|tone/i.test(generatedPrompt.value)) { score += 20; feedback.push('Includes style/format instructions.'); } else { improvements.push('Add instructions for format/style.'); }
  if (/context|background/i.test(generatedPrompt.value) || generatedPrompt.value.length > inputText.value.length * 0.1) { score += 15; feedback.push('Provides sufficient context.'); } else { improvements.push('Add more background context.'); }
  if (/constraint|limit|require|must/i.test(generatedPrompt.value)) { score += 15; feedback.push('Specifies constraints.'); } else { improvements.push('Consider adding constraints (e.g., word count).'); }
  if (!/please|kindly/i.test(generatedPrompt.value)) { score += 15; feedback.push('Uses a direct, professional tone.'); } else { improvements.push('Use a more directive tone instead of polite requests.'); }

  validationResults.value = {
    score: Math.min(100, score),
    feedback,
    improvements: improvements.length > 0 ? improvements : ['Excellent quality!'],
  };
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    // Optional: Show a success toast/notification
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);
    alert('Failed to copy to clipboard.');
  }
};

const loadExample = (type: ExampleKey): void => {
  const example = EXAMPLES[type];
  if (example) {
    clearAll();
    inputText.value = example.text;
    selectedTemplate.value = example.template;
    specializedTemplate.value = example.specialized;
    options.domain = example.options.domain;
    options.focus = example.options.focus;
  }
};

const clearAll = (): void => {
  inputText.value = '';
  generatedPrompt.value = '';
  validationResults.value = null;
  error.value = '';
  usageStats.value = null;
  options.domain = '';
  options.complexity = '';
  options.focus = '';
  options.outputFormat = 'prompt-only';
  selectedTemplate.value = 'CORE_INFERENCE';
  specializedTemplate.value = '';
};

</script>