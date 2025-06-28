<template>
  <div class="flex flex-col h-full space-y-6">
    <!-- Header with actions -->
    <div class="flex items-center justify-between bg-white border-b border-gray-200 pb-4">
      <div>
        <!--<h2 class="text-2xl font-bold text-gray-900">Prompt Editor</h2>-->
        <p class="text-sm text-gray-600 mt-1" v-if="lastSaved">
          Last saved {{ formatRelativeTime(lastSaved) }}
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Auto-save indicator -->
        <div class="flex items-center space-x-2 text-sm" :class="saveStatusClass">
          <div class="w-2 h-2 rounded-full" :class="saveIndicatorClass"></div>
          <span>{{ saveStatusText }}</span>
        </div>
        
        <!-- Save button -->
        <button
          @click="savePrompt"
          :disabled="!hasChanges || isSaving"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :class="saveButtonClass"
        >
          <Save class="w-4 h-4 mr-2" v-if="!isSaving" />
          <Loader2 class="w-4 h-4 mr-2 animate-spin" v-else />
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>

        <!-- Actions dropdown -->
        <div class="relative" v-click-outside="closeActionsMenu">
          <button
            @click="showActionsMenu = !showActionsMenu"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="More actions"
          >
            <MoreVertical class="w-5 h-5" />
          </button>
          
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 transform -translate-y-2"
            enter-to-class="opacity-100 scale-100 transform translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 transform translate-y-0"
            leave-to-class="opacity-0 scale-95 transform -translate-y-2"
          >
            <div
              v-if="showActionsMenu"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <button
                @click="exportPrompt"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Download class="w-4 h-4 mr-2" />
                Export Prompt
              </button>
              <button
                @click="copyToClipboard"
                class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Copy class="w-4 h-4 mr-2" />
                Copy to Clipboard
              </button>
              <hr class="my-2 border-gray-200" />
              <button
                @click="resetPrompt"
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
              >
                <RotateCcw class="w-4 h-4 mr-2" />
                Reset to Last Saved
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Form content -->
    <div class="flex-grow flex flex-col space-y-6">
      <!-- Prompt name -->
      <div class="space-y-2">
        <label for="prompt-name" class="block text-sm font-medium text-gray-700">
          Prompt Name <span class="text-red-500">*</span>
        </label>
        <input
          id="prompt-name"
          v-model="currentPrompt.name"
          placeholder="Enter a descriptive name for your prompt..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': !currentPrompt.name.trim() }"
          required
        />
        <p v-if="!currentPrompt.name.trim()" class="text-sm text-red-600">
          Prompt name is required
        </p>
      </div>

      <!-- Content editor -->
      <div class="flex-grow flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <label for="prompt-content" class="block text-sm font-medium text-gray-700">
            Prompt Content
          </label>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ contentStats.characters }} characters</span>
            <span>{{ contentStats.words }} words</span>
            <span>{{ contentStats.lines }} lines</span>
          </div>
        </div>
        
        <div class="flex-grow relative">
          <textarea
            id="prompt-content"
            ref="textareaRef"
            v-model="currentPromptContent"
            placeholder="Write your prompt content here...&#10;&#10;You can use variables like {{variable_name}} and include instructions, examples, and context."
            class="flex-grow w-full h-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed resize-none"
            :class="{ 'pr-20': showWordCount }"
            @keydown="handleKeydown"
            @scroll="handleScroll"
          ></textarea>
          
          <!-- Floating word count -->
          <div
            v-if="showWordCount && currentPromptContent.length > 100"
            class="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75"
          >
            {{ contentStats.words }} words
          </div>
        </div>

        <!-- Prompt tips -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Lightbulb class="w-4 h-4 mr-1" />
            Writing Tips
          </h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Be specific and clear about what you want the AI to do</li>
            <li>• Use examples to demonstrate the desired output format</li>
            <li>• Include relevant context and constraints</li>
            <li>• Use variables like {{user_input}} for dynamic content</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts help -->
    <div class="text-xs text-gray-500 flex items-center justify-between border-t border-gray-200 pt-4">
      <div class="flex items-center space-x-4">
        <span><kbd class="px-1 py-0.5 bg-gray-100 rounded">Ctrl+S</kbd> Save</span>
        <span><kbd class="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Z</kbd> Undo</span>
        <span><kbd class="px-1 py-0.5 bg-gray-100 rounded">Tab</kbd> Indent</span>
      </div>
      <button
        @click="showWordCount = !showWordCount"
        class="text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        {{ showWordCount ? 'Hide' : 'Show' }} word count
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { 
  Save, 
  Loader2, 
  MoreVertical, 
  Download, 
  Copy, 
  RotateCcw, 
  Lightbulb 
} from 'lucide-vue-next';
import type { VersionedPrompt, PromptVersion } from '../types/appTypes';

interface Props {
  initialPrompt: VersionedPrompt;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoSave: true,
  autoSaveDelay: 3000
});

const emit = defineEmits<{
  'update:prompt': [prompt: VersionedPrompt];
  'export': [prompt: VersionedPrompt];
}>();

// Refs
const textareaRef = ref<HTMLTextAreaElement>();
const currentPrompt = ref<VersionedPrompt>({ ...props.initialPrompt });
const currentPromptContent = ref('');
const isSaving = ref(false);
const lastSaved = ref<Date | null>(null);
const showActionsMenu = ref(false);
const showWordCount = ref(false);
const autoSaveTimeout = ref<NodeJS.Timeout>();

// Computed
const hasChanges = computed(() => {
  const lastVersion = currentPrompt.value.versions[currentPrompt.value.versions.length - 1];
  const lastVersionContent = lastVersion?.content || '';
  const nameChanged = currentPrompt.value.name !== props.initialPrompt.name;
  const contentChanged = lastVersionContent !== currentPromptContent.value;
  return nameChanged || contentChanged;
});

const contentStats = computed(() => {
  const content = currentPromptContent.value;
  return {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length
  };
});

const saveStatusText = computed(() => {
  if (isSaving.value) return 'Saving...';
  if (!hasChanges.value) return 'All changes saved';
  if (props.autoSave) return 'Auto-save enabled';
  return 'Unsaved changes';
});

const saveStatusClass = computed(() => ({
  'text-gray-600': !hasChanges.value,
  'text-amber-600': hasChanges.value && props.autoSave,
  'text-red-600': hasChanges.value && !props.autoSave
}));

const saveIndicatorClass = computed(() => ({
  'bg-green-400': !hasChanges.value,
  'bg-amber-400 animate-pulse': hasChanges.value && props.autoSave,
  'bg-red-400': hasChanges.value && !props.autoSave
}));

const saveButtonClass = computed(() => ({
  'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm': hasChanges.value && !isSaving.value,
  'bg-gray-300 text-gray-500 cursor-not-allowed': !hasChanges.value || isSaving.value
}));

// Methods
const initializeContent = () => {
  const lastVersion = props.initialPrompt.versions[props.initialPrompt.versions.length - 1];
  currentPromptContent.value = lastVersion?.content || '';
  lastSaved.value = lastVersion?.timestamp || null;
};

const savePrompt = async () => {
  if (!hasChanges.value || isSaving.value) return;
  
  isSaving.value = true;
  
  try {
    // Simulate save delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    currentPrompt.value.updatedAt = now;
    
    // Only create new version if content actually changed
    const lastVersion = currentPrompt.value.versions[currentPrompt.value.versions.length - 1];
    if (!lastVersion || lastVersion.content !== currentPromptContent.value) {
      const newVersion: PromptVersion = {
        content: currentPromptContent.value,
        timestamp: now,
        id: crypto.randomUUID(),
        description: `Updated ${formatRelativeTime(now)}`
      };
      currentPrompt.value.versions.push(newVersion);
    }
    
    emit('update:prompt', { ...currentPrompt.value });
    lastSaved.value = now;
  } catch (error) {
    console.error('Failed to save prompt:', error);
  } finally {
    isSaving.value = false;
  }
};

const autoSave = () => {
  if (!props.autoSave || !hasChanges.value) return;
  
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  autoSaveTimeout.value = setTimeout(() => {
    savePrompt();
  }, props.autoSaveDelay);
};

const exportPrompt = () => {
  emit('export', currentPrompt.value);
  showActionsMenu.value = false;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentPromptContent.value);
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
  showActionsMenu.value = false;
};

const resetPrompt = () => {
  if (confirm('Are you sure you want to reset to the last saved version? All unsaved changes will be lost.')) {
    initializeContent();
    showActionsMenu.value = false;
  }
};

const closeActionsMenu = () => {
  showActionsMenu.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+S to save
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    savePrompt();
  }
  
  // Tab support in textarea
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const value = currentPromptContent.value;
    currentPromptContent.value = value.substring(0, start) + '  ' + value.substring(end);
    
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + 2;
      }
    });
  }
};

const handleScroll = () => {
  // Could add scroll-based features here
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

// Watchers
watch(() => props.initialPrompt, (newVal) => {
  currentPrompt.value = { ...newVal };
  initializeContent();
}, { deep: true });

watch(currentPromptContent, () => {
  if (props.autoSave) {
    autoSave();
  }
});

// Lifecycle
onMounted(() => {
  initializeContent();
});

onUnmounted(() => {
  if (autoSaveTimeout.value) {
    clearTimeout(autoSaveTimeout.value);
  }
});

// Custom directive for click outside
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutside);
  }
};
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

textarea {
  field-sizing: content;
}

@media (max-height: 600px) {
  .flex-grow {
    min-height: 200px;
  }
}
</style>