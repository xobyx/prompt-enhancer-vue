<template>
  <div class="flex h-screen bg-gray-50 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="isSidebarOpen && isMobile" 
      @click="closeSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <div 
      class="bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50"
      :class="{
        'w-64 lg:w-64': true,
        'fixed inset-y-0 left-0 transform lg:translate-x-0 lg:static lg:inset-auto': isMobile,
        'translate-x-0': isSidebarOpen || !isMobile,
        '-translate-x-full': !isSidebarOpen && isMobile
      }"
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">Your Prompts</h3>
        <button 
          v-if="isMobile"
          @click="closeSidebar"
          class="p-2 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Prompts List -->
      <div class="flex-grow overflow-y-auto">
        <ul>
          <li
            v-for="p in allPrompts"
            :key="p.id"
            @click="selectPrompt(p)"
            class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
            :class="{ 'bg-indigo-50 border-l-4 border-l-indigo-500': selectedPrompt && selectedPrompt.id === p.id }"
          >
            <div class="font-medium text-gray-800 truncate">
              {{ p.name || 'Untitled Prompt' }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatDate(p.updatedAt) }}
            </div>
          </li>
        </ul>
      </div>

      <!-- New Prompt Button -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="createNewPrompt"
          class="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors touch-manipulation"
        >
          <Plus class="w-5 h-5 mr-2" />
          New Prompt
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow flex flex-col overflow-hidden">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          @click="openSidebar"
          class="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
        >
          <Menu class="w-6 h-6 text-gray-600" />
        </button>
        <h1 class="text-lg font-semibold text-gray-800 truncate ml-2">
          {{ selectedPrompt?.name || 'Prompts' }}
        </h1>
        <div class="w-10"></div> <!-- Spacer for centering -->
      </div>

      <!-- Content Area -->
      <div v-if="selectedPrompt" class="flex-grow overflow-auto">
        <div class="p-4 lg:p-6">
          <div class="max-w-4xl mx-auto space-y-4 lg:space-y-6">
            <VersionedPromptManager
              :initialPrompt="selectedPrompt"
              @update:prompt="handlePromptUpdate"
              ref="promptManagerRef"
            />
            <PromptHistory
              :versions="selectedPrompt.versions"
              :currentContent="selectedPrompt.versions[selectedPrompt.versions.length - 1]?.content || ''"
              @revert="handleRevert"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-grow flex items-center justify-center p-6">
        <div class="text-center max-w-md">
          <FileText class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-lg font-medium text-gray-900">No prompt selected</h3>
          <p class="mt-1 text-sm text-gray-500 text-center">
            {{ isMobile ? 'Tap the menu to select a prompt or create a new one.' : 'Select a prompt from the sidebar or create a new one to get started.' }}
          </p>
          <button
            @click="isMobile ? openSidebar() : createNewPrompt()"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
          >
            <component :is="isMobile ? Menu : Plus" class="-ml-1 mr-2 h-5 w-5" />
            {{ isMobile ? 'Open Menu' : 'New Prompt' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, FileText, Menu, X } from 'lucide-vue-next';
import VersionedPromptManager from '../components/VersionedPromptManager.vue';
import PromptHistory from '../components/PromptHistory.vue';
import { loadVersionedPrompts, saveVersionedPrompts } from '../utils/storageUtils';
import type { VersionedPrompt } from '../types/appTypes';

const router = useRouter();

const allPrompts = ref<VersionedPrompt[]>(loadVersionedPrompts());
const selectedPrompt = ref<VersionedPrompt | null>(null);
const promptManagerRef = ref<InstanceType<typeof VersionedPromptManager> | null>(null);

// Mobile responsive state
const isMobile = ref(false);
const isSidebarOpen = ref(false);

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg breakpoint
  if (!isMobile.value) {
    isSidebarOpen.value = false; // Close sidebar on desktop
  }
};

const openSidebar = () => {
  isSidebarOpen.value = true;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// Load prompt from route param if available
const routePromptId = router.currentRoute.value.params.id as string;
if (routePromptId) {
  const foundPrompt = allPrompts.value.find(p => p.id === routePromptId);
  if (foundPrompt) {
    selectedPrompt.value = foundPrompt;
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const selectPrompt = (prompt: VersionedPrompt) => {
  selectedPrompt.value = prompt;
  router.push({ name: 'prompt-versioning', params: { id: prompt.id } });
  
  // Close sidebar on mobile after selection
  if (isMobile.value) {
    closeSidebar();
  }
};

const createNewPrompt = () => {
  const newPrompt: VersionedPrompt = {
    id: Date.now().toString(),
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    versions: [{ content: '', timestamp: new Date() }]
  };
  allPrompts.value.push(newPrompt);
  selectedPrompt.value = newPrompt;
  saveVersionedPrompts(allPrompts.value);
  router.push({ name: 'prompt-versioning', params: { id: newPrompt.id } });
  
  // Close sidebar on mobile after creating
  if (isMobile.value) {
    closeSidebar();
  }
};

const handlePromptUpdate = (updatedPrompt: VersionedPrompt) => {
  const index = allPrompts.value.findIndex(p => p.id === updatedPrompt.id);
  if (index !== -1) {
    allPrompts.value[index] = updatedPrompt;
    saveVersionedPrompts(allPrompts.value);
  }
};

const handleRevert = (content: string) => {
  if (selectedPrompt.value) {
    selectedPrompt.value.versions[selectedPrompt.value.versions.length - 1].content = content;
    if (promptManagerRef.value) {
      promptManagerRef.value.currentPromptContent = content;
    }
  }
};

// Watch for changes in selectedPrompt and update local storage
watch(selectedPrompt, (newVal) => {
  if (newVal) {
    saveVersionedPrompts(allPrompts.value);
  }
}, { deep: true });

// Initial load and selection if no prompt is selected
if (!selectedPrompt.value && allPrompts.value.length > 0) {
  selectedPrompt.value = allPrompts.value[0];
  router.push({ name: 'prompt-versioning', params: { id: selectedPrompt.value.id } });
}

// Lifecycle hooks for mobile detection
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
/* Ensure touch targets are at least 44px for better mobile UX */
.touch-manipulation {
  touch-action: manipulation;
  min-height: 44px;
}

/* Improve scroll behavior on mobile */
@media (max-width: 1023px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Add safe area insets for iOS devices */
@supports (padding: max(0px)) {
  .lg\:hidden {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
  
  .fixed.inset-y-0.left-0 {
    padding-left: max(0px, env(safe-area-inset-left));
  }
}
</style>