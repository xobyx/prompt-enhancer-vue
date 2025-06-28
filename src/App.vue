<template>
  <div :class="['min-h-screen transition-all duration-500', darkMode ? 'dark bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50']">
    
    <!-- Enhanced Header -->
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo/Brand -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code class="w-4 h-4 text-white" />
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DevStudio
            </span>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-1">
            <button
              v-for="item in navigationItems"
              :key="item.id"
              @click="handleNavigation(item)"
              :class="[
                'flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200',
                activeSection === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
              ]"
              :title="item.label"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span class="text-sm font-medium hidden lg:block">{{ item.label }}</span>
            </button>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center space-x-2">
            <!-- History Button -->
            <button
              @click="store.isHistoryPanelOpen = true"
              class="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
              title="Show History"
            >
              <History class="w-4 h-4" />
            </button>

            <!-- Notifications -->
            <button class="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm relative">
              <Bell class="w-4 h-4" />
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
              :title="store.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <Sun v-if="store.darkMode" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
            </button>

            <!-- Settings -->
            <button class="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm">
              <Settings class="w-4 h-4" />
            </button>

            <!-- Mobile Menu Button -->
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <X v-if="isMobileMenuOpen" class="w-4 h-4" />
              <Menu v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="isMobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div class="px-4 py-3 space-y-2">
              <button
                v-for="item in navigationItems"
                :key="item.id"
                @click="handleNavigation(item)"
                :class="[
                  'flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200',
                  activeSection === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                ]"
              >
                <component :is="item.icon" class="w-5 h-5" />
                <span class="font-medium">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="relative">
      <router-view />
    </main>

    <!-- History Panel -->
    <HistoryPanel
      v-if="store.isHistoryPanelOpen && store.activeProject"
      :active-project-name="store.activeProject.name"
      :prompt-history="store.promptHistory"
      @load-from-history="store.loadFromHistory"
      @close="store.isHistoryPanelOpen = false"
    />

    <!-- Overlay for mobile menu -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, onMounted, watch, ref } from 'vue'
import { useAppStore } from './stores/app'
import HistoryPanel from './components/HistoryPanel.vue'

import {
  Home, Settings, Code, Zap, History, Sun, Moon, Search, 
  GitFork, Brain, Menu, X, Bell
} from 'lucide-vue-next'

interface NavigationItem {
  id: string
  icon: any
  label: string
  path: string
}

const router = useRouter()
const store = useAppStore()

// Reactive data
const isMobileMenuOpen = ref(false)
const activeSection = ref('home')

// Computed properties
const darkMode = computed(() => store.darkMode)

// Navigation items with proper icons and descriptions
const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'prompt-enhancer', icon: Home, label: 'Prompt Enhancer', path: '/prompt-enhancer' },
  { id: 'workflows', icon: GitFork, label: 'Workflows', path: '/workflows' },
  { id: 'reverse-engineering', icon: Search, label: 'Reverse Engineering', path: '/reverse-engineering' },
  { id: 'logic-analysis', icon: Brain, label: 'Logic Analysis', path: '/logic-analysis' },
  { id: 'code-gen', icon: Code, label: 'Code Generator', path: '/code-generator' },
  { id: 'automation', icon: Zap, label: 'Automation', path: '/automation' }
]

// Methods
const handleNavigation = (item: NavigationItem): void => {
  activeSection.value = item.id
  router.push(item.path)
  isMobileMenuOpen.value = false
}

const toggleDarkMode = (): void => {
  store.darkMode = !store.darkMode
  store.savePreferences()
}

const getFeatureDescription = (id: string): string => {
  const descriptions: Record<string, string> = {
    'prompt-enhancer': 'Enhance and optimize your AI prompts for better results',
    'workflows': 'Design and manage complex development workflows with visual tools',
    'reverse-engineering': 'Analyze and understand existing codebases and systems',
    'logic-analysis': 'Perform deep logical analysis and reasoning on your projects',
    'code-gen': 'Generate clean, efficient code using AI-powered tools',
    'automation': 'Automate repetitive tasks and streamline your development process'
  }
  return descriptions[id] || 'Explore this powerful feature'
}

// Watchers
watch(() => store.darkMode, store.savePreferences)
watch(() => store.apiKey, store.savePreferences)
watch(() => store.projects, store.saveProjectsToStorage, { deep: true })
watch(() => store.activeProjectId, store.saveProjectsToStorage)

// Lifecycle
onMounted(() => {
  store.initializeProjects()
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Backdrop blur fallback for older browsers */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-xl {
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .dark .backdrop-blur-xl {
    background-color: rgba(17, 24, 39, 0.95);
  }
}

/* Focus styles for accessibility */
button:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900;
}
</style>