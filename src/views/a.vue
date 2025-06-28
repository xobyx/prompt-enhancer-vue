<template>
       <!-- Welcome section if no specific route content -->
      <div class="max-w-4xl mx-auto px-4 py-16">
        <div class="text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Code class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to DevStudio
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your comprehensive development environment for workflows, reverse engineering, logic analysis, and more.
          </p>
          
          <!-- Feature Cards -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div
              v-for="item in navigationItems.slice(1)"
              :key="item.id"
              @click="handleNavigation(item)"
              class="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <component :is="item.icon" class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {{ item.label }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                {{ getFeatureDescription(item.id) }}
              </p>
            </div>
          </div>
        </div>
      </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Home, Settings, Code, Zap, History, Sun, Moon, Search, 
  GitFork, Brain, Menu, X, Bell
} from 'lucide-vue-next'

interface NavigationItem {
  id: string
  icon: any // Lucide icon component type
  label: string
  path: string
}

const router = useRouter()
const isMobileMenuOpen = ref(false)

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'prompt-enhancer', icon: Home, label: 'Prompt Enhancer', path: '/prompt-enhancer' },
  { id: 'workflows', icon: GitFork, label: 'Workflows', path: '/workflows' },
  { id: 'reverse-engineering', icon: Search, label: 'Reverse Engineering', path: '/reverse-engineering' },
  { id: 'logic-analysis', icon: Brain, label: 'Logic Analysis', path: '/logic-analysis' },
  { id: 'code-gen', icon: Code, label: 'Code Generator', path: '/code-generator' },
  { id: 'automation', icon: Zap, label: 'Automation', path: '/automation' }
]

const handleNavigation = (item: NavigationItem): void => {
  router.push(item.path)
  isMobileMenuOpen.value = false
}

const getFeatureDescription = (id: string): string => {
  const descriptions: Record<string, string> = {
    'prompt-enhancer': 'Enhance and optimize your AI prompts for better results.',
    'workflows': 'Design and manage complex development workflows with visual tools.',
    'reverse-engineering': 'Analyze and understand existing codebases and systems.',
    'logic-analysis': 'Perform deep logical analysis and reasoning on your projects.',
    'code-gen': 'Generate clean, efficient code using AI-powered tools.',
    'automation': 'Automate repetitive tasks and streamline your development process.'
  }
  return descriptions[id] || 'Explore this powerful feature.'
}
</script>

<style scoped>
/* Add any custom styles here */
[role="button"]:focus {
  @apply ring-2 ring-blue-500 outline-none;
}
</style>