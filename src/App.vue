<template>
  <div :class="['min-h-screen transition-colors duration-300', darkMode ? 'dark bg-gray-900' : 'bg-gray-50']">

    
    <!-- Workflow Builder View -->
    <WorkflowBuilder 
      v-if="store.isEditingWorkflow && store.activeWorkflow"
      :workflow="store.activeWorkflow"
      @update="store.activeWorkflow = $event"
      @save="store.saveWorkflow"
      @cancel="store.isEditingWorkflow = false"
    />
    <ReverseEngineerPrompt 
          v-else-if="store.view === 'reverse-engineering'"
          @back="store.view = 'prompt'"
    />
    <!-- Workflow Runner View -->
    <WorkflowRunner 
      v-else-if="store.isRunningWorkflow && store.activeWorkflow"
      :workflow="store.activeWorkflow"
      :api-key="store.apiKey"
      :model-params="store.modelParams"
      @complete="store.completeWorkflow"
      @cancel="store.isRunningWorkflow = false"
    />
    
    <!-- Workflow History View -->
    <div v-else-if="store.workflowHistory" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <GitBranch class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Workflow Execution History
          </h1>
        </div>
        <button 
          @click="store.workflowHistory = null"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          Back
        </button>
      </div>
      <WorkflowHistoryView :execution="store.workflowHistory" />
    </div>
    
    <!-- Workflows Management View -->
    <div v-else-if="store.view === 'workflows'" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <GitFork class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Workflow Management
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="store.view = 'prompt'"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            Back
          </button>
          <button 
            @click="store.createWorkflow"
            class="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus class="w-4 h-4" /> New
          </button>
        </div>
      </div>
      
      <!-- Workflows List -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Workflows in Project</h2>
        <div v-if="store.activeProject && store.activeProject.workflows.length === 0" class="bg-gray-50 dark:bg-gray-900 rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <ListTree class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-4 text-lg font-medium">No workflows created yet</h3>
          <p class="text-gray-500 mt-2">
            Create your first workflow to chain prompts with conditional logic.
          </p>
          <button 
            @click="store.createWorkflow"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Create Workflow
          </button>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="workflow in store.activeProject?.workflows"
            :key="workflow.id" 
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex justify-between items-start">
                <h3 class="font-semibold text-lg mb-2">{{ workflow.name }}</h3>
                <div class="flex gap-1">
                  <button 
                    @click="editWorkflow(workflow)"
                    class="p-1.5 text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <Settings class="w-4 h-4" />
                  </button>
                  <button 
                    @click="store.runWorkflow(workflow)"
                    class="p-1.5 text-gray-500 hover:text-green-600"
                    title="Run"
                  >
                    <Play class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-500 mb-4">
                {{ workflow.steps.length }} steps, 
                {{ workflow.executions?.length || 0 }} execution{{ (workflow.executions?.length || 0) === 1 ? '' : 's' }}
              </p>
              <div class="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-32 overflow-auto">
                <pre>{{ workflow.steps.map(s => s.name).join(' → ') }}</pre>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 text-sm text-gray-500">
              Created {{ workflow.createdAt ? formatDate(workflow.createdAt) : 'Unknown' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Executions -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Recent Executions</h2>
        <div v-if="recentExecutions.length === 0" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <History class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-4 font-medium">No executions yet</h3>
          <p class="text-gray-500 mt-2">
            Run a workflow to see execution history here.
          </p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps Executed</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="{ workflow, execution } in recentExecutions" :key="execution.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ workflow.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    execution.steps.every(s => s.success)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]">
                    {{ execution.steps.every(s => s.success) ? 'Success' : 'Failed' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ execution.steps.length }} / {{ workflow.steps.length }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(execution.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    @click="store.workflowHistory = execution"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Main Prompt Engineering Interface -->
    <div v-else class="flex h-screen w-full">
      <ProjectSidebar
        :projects="store.projects"
        :active-project-id="store.activeProjectId"
        :is-open="store.isSidebarOpen"
        @select-project="store.selectProject"
        @create-project="store.createProject"
        @close="store.isSidebarOpen = false"
      />
      
      <main class="flex-1 h-screen overflow-y-auto">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-3">
              <button 
                @click="store.isSidebarOpen = true" 
                class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors md:hidden" 
                title="Show Projects"
              >
                <LayoutGrid class="w-5 h-5" />
              </button>
              <Bot class="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Prompt Engineering Assistant</h1>
            </div>
            <div class="flex items-center gap-2 md:gap-4">
              <button 
                @click="store.view = 'workflows'"
                class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Workflows"
              >
                <GitFork class="w-5 h-5" />
              </button>
              <button 
                @click="store.view = 'reverse-engineering'"
                class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Reverse Engineering"
              >
                <Search class="w-5 h-5" />
              </button>
              <button 
                @click="store.isHistoryPanelOpen = true" 
                class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
                title="Show History"
              >
                <History class="w-5 h-5" />
              </button>
              <button 
                @click="toggleDarkMode" 
                class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
                :title="store.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              >
                <Sun v-if="store.darkMode" class="w-5 h-5" />
                <Moon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Main Form -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- API Key -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Google Gemini API Key</label>
                <input 
                  v-model="store.apiKey"
                  type="password" 
                  placeholder="Enter your Google Gemini API key" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
                  required
                />
                <p class="text-xs mt-1 text-gray-500 dark:text-gray-400">Your key is stored locally and never sent to our servers.</p>
              </div>
              
              <!-- Enhancement Approach -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enhancement Approach</label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    v-for="(version, key) in promptVersions"
                    :key="key" 
                    @click="store.selectedVersion = key" 
                    :class="[
                      'p-4 border-2 rounded-lg cursor-pointer transition-all',
                      store.selectedVersion === key 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    <div class="flex items-center gap-3 mb-2">
                      <component :is="version.icon" />
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ version.name }}</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ version.description }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Input Prompt -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Prompt to Enhance</label>
                <textarea 
                  v-model="store.inputPrompt"
                  placeholder="Enter your prompt that you want to enhance..." 
                  rows="6" 
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical" 
                  required
                />
                <VariableEditor v-if="store.variableDefinitions.length > 0" />
  
              <!-- Add variable button -->
                <button 
                  @click="store.addVariable('var1')"
                  class="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus class="w-4 h-4 mr-1" /> Add Variables to Prompt
                </button>
              </div>

              
              <!-- Model Parameters -->
              <details class="border dark:border-gray-700 rounded-lg p-4">
                <summary class="cursor-pointer font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
                  Model & Generation Parameters 
                  <ChevronsUpDown class="w-5 h-5 text-gray-500" />
                </summary>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                    <select 
                      v-model="store.modelParams.model"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="gemini-2.5-flash-preview-04-17">gemini-2.5-flash-preview-04-17</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Temperature: {{ store.modelParams.temperature }}
                    </label>
                    <input 
                      v-model="store.modelParams.temperature"
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Tokens</label>
                    <input 
                      v-model="store.modelParams.maxOutputTokens"
                      type="number" 
                      min="1" 
                      max="8192" 
                      
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </details>
              
              <!-- Submit Buttons -->
              <div class="flex gap-3 pt-2">
                <button
                  input="submit"
                  type="submit"
                 
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
                  class="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCw class="w-5 h-5" />
                  New Session
                </button>
              </div>
            </form>
          </div>

          <!-- Error Display -->
          <div v-if="store.error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg p-4 mb-8 flex items-center gap-2">
            <AlertCircle class="w-5 h-5" /> 
            {{ store.error }}
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
          <div v-if="store.result && !store.loading" class="space-y-6">
            <!-- Raw Response Warning -->
            <div v-if="store.result.raw_response" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
              <div class="flex items-center gap-3 mb-4">
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
    
    <!-- History Panel -->
    <HistoryPanel
      v-if="store.isHistoryPanelOpen && store.activeProject"
      :active-project-name="store.activeProject.name"
      :prompt-history="store.promptHistory"
      @load-from-history="store.loadFromHistory"
      @close="store.isHistoryPanelOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { 
  Bot, Settings, Sparkles, Code, Zap, AlertCircle, Copy, Check, History, 
  Sun, Moon, Star, Download, RotateCw, LayoutGrid, X, Plus, ChevronsUpDown, 
  TestTube2, GitFork, Play, ListTree, GitBranch,Search
} from 'lucide-vue-next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Components
import ProjectSidebar from './components/ProjectSidebar.vue';
import ComparisonPanel from './components/ComparisonPanel.vue';
import WorkflowBuilder from './components/WorkflowBuilder.vue';
import WorkflowRunner from './components/WorkflowRunner.vue';
import WorkflowHistoryView from './components/WorkflowHistoryView.vue';
import MarkdownRenderer from './components/MarkdownRenderer.vue';
import LoadingSkeleton from './components/LoadingSkeleton.vue';
import HistoryPanel from './components/HistoryPanel.vue';
import PromptCard from './components/PromptCard.vue';
import VariableEditor from './components/VariableEditor.vue';
import ReverseEngineerPrompt from './components/ReverseEngineerPrompt.vue';
// Store and utilities
import { useAppStore } from './stores/app';
import { promptVersions } from './constants/appConstants';
import { parseGeminiResponse, executeGeminiPrompt } from './utils/apiUtils';
import { formatDate } from './utils/exportUtils';
import type { PromptHistoryItem, ComparisonResult, PromptVariant } from './types/appTypes';

const store = useAppStore();

// Computed properties
const darkMode = computed(() => store.darkMode);

const analysisText = computed(() => 
  store.result?.analysis || store.result?.initial_assessment || store.result?.architectural_analysis
);

const selectedVariantsForComparison = computed(() => 
  store.variants.filter((v: PromptVariant) => store.selectedVariantsForComparison.includes(v.id))
);

const recentExecutions = computed(() => {
  if (!store.activeProject) return [];
  
  return store.activeProject.workflows
    .flatMap(workflow => 
      (workflow.executions || []).map(execution => ({ workflow, execution }))
    )
    .sort((a, b) => 
      b.execution.createdAt.getTime() - a.execution.createdAt.getTime()
    );
});

// Methods
const toggleDarkMode = () => {
  store.darkMode = !store.darkMode;
  store.savePreferences();
};

const editWorkflow = (workflow: any) => {
  store.activeWorkflow = workflow;
  store.isEditingWorkflow = true;
};

const copyToClipboard = async (text: string, id: string) => {
  try {
    await navigator.clipboard.writeText(text);
    store.copied = id;
    setTimeout(() => store.copied = '', 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    store.error = 'Failed to copy to clipboard.';
  }
};

const handleSubmit = async (event: Event,isReEnhance: boolean = false) => {
  console.log("👍👍")
  if (!store.apiKey.trim() || !store.inputPrompt.trim()) {
    store.error = 'API Key and an input prompt are required.';
    return;
  }
  
  store.loading = true;
  store.error = '';
  const promptWithVars = store.applyVariables(store.inputPrompt);
  
  if (!isReEnhance) {
    store.result = null;
    store.selectedVariantsForComparison = [];
    store.comparisonResults = [];
    store.questionAnswers = {};
  }
  store.showQuestionForm = false;

  try {
    const selectedPromptData = promptVersions[store.selectedVersion as keyof typeof promptVersions];
    let fullPrompt = `${selectedPromptData.prompt}\n\nORIGINAL PROMPT TO ENHANCE:\n"""\n${promptWithVars}\n"""`;

    if (Object.keys(store.questionAnswers).length > 0 && isReEnhance) {
      fullPrompt += `\n\nADDITIONAL CONTEXT FROM USER ANSWERS:`;
      Object.entries(store.questionAnswers).forEach(([question, answer]) => {
        if (answer.trim()) {
          fullPrompt += `\n- Question: "${question}"\n- Answer: "${answer}"\n`;
        }
      });
    }
    
    fullPrompt += '\n\nPlease analyze and enhance this prompt according to the specifications above. Return only valid JSON.';

    const responseText = await executeGeminiPrompt(store.apiKey, fullPrompt, store.modelParams);
    const jsonResponse = parseGeminiResponse(responseText);
    store.result = jsonResponse;
    
    const questions = jsonResponse.questions || jsonResponse.clarifying_questions || jsonResponse.clarification_needed;
    if (questions && questions.length > 0 && !isReEnhance) {
      store.showQuestionForm = true;
    }
    console.log("isReEnhance : " ,isReEnhance)
    console.log("project",store.activeProject)
    if (store.activeProject) {
      const historyItem: PromptHistoryItem = { 
        id: Date.now().toString(), 
        timestamp: new Date(), 
        inputPrompt: store.inputPrompt, 
        version: store.selectedVersion, 
        result: jsonResponse,
        // Save question answers in history
        questionAnswers: Object.keys(store.questionAnswers).length > 0 ? {...store.questionAnswers} : undefined
      };
      
      // If this is a re-enhance, update the existing history item
      if (isReEnhance && store.promptHistory.length > 0) {
        const lastHistoryIndex = store.promptHistory.length - 1;
        historyItem.questionAnswers= {...store.questionAnswers};
        historyItem.result= jsonResponse;
        historyItem.reEnhanced = true;
        historyItem.reEnhancedAt= new Date();
        store.updateHistory(historyItem);
        //store.saveProjectsToStorage();
      } else if (!isReEnhance) {
        store.addToHistory(historyItem);
      }
    }
  } catch (err: any) {
    console.error('API Error:', err);
    store.error = `Error: ${err.message || 'Failed to process your request. Please try again.'}`;
  } finally {
    store.loading = false;
  }
};

const handleAnswerSubmit = () => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
handleSubmit(submitEvent,true);
};

const handleRunComparison = async (testPrompt: string) => {
  store.isComparing = true;
  const variantsToTest = store.variants;
  const selected = variantsToTest.filter((v: PromptVariant) => store.selectedVariantsForComparison.includes(v.id));

  store.comparisonResults = selected.map((v: any) => ({ variantId: v.id, output: '', loading: true }));

  const genAI = new GoogleGenerativeAI(store.apiKey);
  const model = genAI.getGenerativeModel({
    model: store.modelParams.model,
    generationConfig: { 
      temperature: store.modelParams.temperature, 
      maxOutputTokens: store.modelParams.maxOutputTokens 
    }
  });

  const promises = selected.map(async (variant: PromptVariant) => {
    try {
      const fullPrompt = `${variant.prompt}\n\n---\n\nUSER REQUEST:\n${testPrompt}`;
      const generationResult = await model.generateContent(fullPrompt);
      const responseText = await generationResult.response.text();
      return { variantId: variant.id, output: responseText, loading: false };
    } catch (error: any) {
      return { variantId: variant.id, output: '', error: error.message, loading: false };
    }
  });
  
  for (const promise of promises) {
    promise.then((res: any) => {
      store.comparisonResults = store.comparisonResults.map(r => 
        r.variantId === res.variantId ? res : r
      );
    });
  }
  
  await Promise.allSettled(promises);
  store.isComparing = false;
};

// Watchers
watch(() => store.darkMode, store.savePreferences);
watch(() => store.apiKey, store.savePreferences);
watch(() => store.projects, store.saveProjectsToStorage, { deep: true });
watch(() => store.activeProjectId, store.saveProjectsToStorage);

// Lifecycle
onMounted(() => {
  store.initializeProjects();
});




// Add these new methods:
const handleStartEdit = (promptId: string, content: string) => {
  store.editingPromptId = promptId;
  store.editedPromptContent = content;
};

const handleSaveEdit = (promptId: string, newContent: string) => {
  const variantIndex = store.variants.findIndex((v:any) => v.id === promptId);
  if (variantIndex !== -1) {
    store.variants[variantIndex].prompt = newContent;
    store.variants[variantIndex].title = `${store.variants[variantIndex].title} (Edited)`;
  }
  store.editingPromptId = '';
  store.editedPromptContent = '';
};

const handleCancelEdit = () => {
  store.editingPromptId = '';
  store.editedPromptContent = '';
};

const handleTestPrompt = async (promptId: string, promptContent: string, testInput: string) => {
  if (!testInput.trim()) {
    store.error = 'Please enter test input';
    return;
  }

  store.testingPromptIds = [...store.testingPromptIds, promptId];
  
  try {
    const genAI = new GoogleGenerativeAI(store.apiKey);
    const model = genAI.getGenerativeModel({
      model: store.modelParams.model,
      generationConfig: { 
        temperature: store.modelParams.temperature, 
        maxOutputTokens: store.modelParams.maxOutputTokens 
      }
    });

    const fullPrompt = `${promptContent}\n\n---\n\nUSER REQUEST:\n${testInput}`;
    const generationResult = await model.generateContent(fullPrompt);
    const responseText = await generationResult.response.text();
    
    store.testResults = {
      ...store.testResults,
      [promptId]: {
        input: testInput,
        output: responseText,
        timestamp: new Date()
      }
    };
  } catch (error: any) {
    store.error = `Test failed: ${error.message}`;
    store.testResults = {
      ...store.testResults,
      [promptId]: {
        input: testInput,
        output: '',
        error: error.message,
        timestamp: new Date()
      }
    };
  } finally {
    store.testingPromptIds = store.testingPromptIds.filter(id => id !== promptId);
  }
};
</script>

