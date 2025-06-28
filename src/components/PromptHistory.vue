<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Version History</h3>
          <p class="text-sm text-gray-600 mt-1">{{ versions.length }} versions saved</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            v-if="activeDiffIndex !== null"
            @click="clearDiff"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Clear diff view"
          >
            Clear diff
          </button>
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" v-if="isLoading"></div>
        </div>
      </div>
    </div>

    <!-- Version List -->
    <div class="max-h-96 overflow-y-auto">
      <div v-if="versions.length === 0" class="px-6 py-8 text-center text-gray-500">
        <FileDiff class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No versions saved yet</p>
      </div>
      
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="(version, index) in versions"
          :key="version.id || index"
          class="px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
          :class="{ 'bg-blue-50 border-l-4 border-l-blue-400': activeDiffIndex === index }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-medium text-gray-900">
                  Version {{ index + 1 }}
                </h4>
                <span
                  v-if="index === 0"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Latest
                </span>
                <span
                  v-if="version.isCurrent"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Current
                </span>
              </div>
              
              <div class="flex items-center space-x-4 mt-1">
                <p class="text-xs text-gray-500">
                  <time :datetime="version.timestamp.toISOString()">
                    {{ formatDate(version.timestamp) }}
                  </time>
                </p>
                <p class="text-xs text-gray-500" v-if="version.author">
                  by {{ version.author }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getContentLength(version.content) }} chars
                </p>
              </div>

              <!-- Version description/notes -->
              <p v-if="version.description" class="text-xs text-gray-600 mt-1 truncate">
                {{ version.description }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="viewDiff(index)"
                :disabled="isLoading"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{ 'bg-blue-50 border-blue-300 text-blue-700': activeDiffIndex === index }"
                :aria-label="`${activeDiffIndex === index ? 'Hide' : 'Show'} diff for version ${index + 1}`"
              >
                <FileDiff class="w-3.5 h-3.5 mr-1.5" />
                {{ activeDiffIndex === index ? 'Hide' : 'Diff' }}
              </button>
              
              <button
                @click="revertTo(index)"
                :disabled="isLoading || index === 0"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                :aria-label="`Revert to version ${index + 1}`"
              >
                <Undo2 class="w-3.5 h-3.5 mr-1.5" />
                Revert
              </button>
            </div>
          </div>

          <!-- Diff content with better styling -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-if="activeDiffIndex === index"
              class="mt-4 bg-gray-900 rounded-lg overflow-hidden"
            >
              <div class="px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div class="flex items-center justify-between">
                  <h5 class="text-xs font-medium text-gray-300">
                    Changes from version {{ index }} to {{ index + 1 }}
                  </h5>
                  <button
                    @click="copyDiff"
                    class="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    :aria-label="copyStatus === 'copied' ? 'Copied!' : 'Copy diff'"
                  >
                    {{ copyStatus === 'copied' ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>
              <div class="p-4 max-h-64 overflow-auto">
                <div
                  class="text-xs font-mono leading-relaxed"
                  v-html="diffContent.startsWith('<div') ? diffContent : formatDiff(diffContent)"
                ></div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { FileDiff, Undo2 } from 'lucide-vue-next';
import type { PromptVersion } from '../types/appTypes';
import { createTwoFilesPatch, diffWords } from 'diff';

interface Props {
  versions: PromptVersion[];
  currentContent: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<{
  revert: [content: string];
  diffViewed: [index: number];
}>();

const diffContent = ref('');
const activeDiffIndex = ref<number | null>(null);
const copyStatus = ref<'idle' | 'copied'>('idle');

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getContentLength = (content: string): string => {
  const length = content.length;
  if (length > 1000) return `${(length / 1000).toFixed(1)}k`;
  return length.toString();
};

const viewDiff = async (index: number) => {
  if (activeDiffIndex.value === index) {
    clearDiff();
    return;
  }

  try {
    const oldContent = index > 0 
      ? props.versions[index - 1].content 
      : '';
    const newContent = props.versions[index].content;
    
    // Create word-level diff for better granularity
    const wordDiff = createWordDiff(oldContent, newContent);
    
    // Fallback to line diff if word diff is too complex
    if (wordDiff.length > 50 || wordDiff.some(part => part.value.length > 200)) {
      diffContent.value = createTwoFilesPatch(
        `Version ${index}`, 
        `Version ${index + 1}`, 
        oldContent, 
        newContent,
        undefined,
        undefined,
        { context: 3 }
      );
    } else {
      diffContent.value = formatWordDiff(wordDiff);
    }
    
    activeDiffIndex.value = index;
    emit('diffViewed', index);
    
    // Scroll to diff after it's rendered
    await nextTick();
    const diffElement = document.querySelector('.bg-blue-50');
    if (diffElement) {
      diffElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } catch (error) {
    console.error('Error generating diff:', error);
  }
};

const clearDiff = () => {
  activeDiffIndex.value = null;
  diffContent.value = '';
};

const revertTo = (index: number) => {
  if (window.confirm(`Are you sure you want to revert to Version ${index + 1}? This action cannot be undone.`)) {
    emit('revert', props.versions[index].content);
  }
};

const copyDiff = async () => {
  try {
    await navigator.clipboard.writeText(diffContent.value);
    copyStatus.value = 'copied';
    setTimeout(() => {
      copyStatus.value = 'idle';
    }, 2000);
  } catch (error) {
    console.error('Failed to copy diff:', error);
  }
};

const createWordDiff = (oldContent: string, newContent: string) => {
  return diffWords(oldContent, newContent);
};

const formatWordDiff = (wordDiff: any[]): string => {
  let result = '';
  let hasChanges = false;
  
  wordDiff.forEach(part => {
    if (part.added) {
      result += `<span class="bg-green-200 text-green-800 px-1 rounded">${escapeHtml(part.value)}</span>`;
      hasChanges = true;
    } else if (part.removed) {
      result += `<span class="bg-red-200 text-red-800 px-1 rounded line-through">${escapeHtml(part.value)}</span>`;
      hasChanges = true;
    } else {
      result += escapeHtml(part.value);
    }
  });
  
  if (!hasChanges) {
    return 'No changes detected';
  }
  
  return `<div class="bg-white p-3 rounded border text-gray-900 font-mono text-sm whitespace-pre-wrap leading-relaxed">${result}</div>`;
};

const formatDiff = (diff: string): string => {
  return diff
    .split('\n')
    .map(line => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        return `<span class="text-green-400 bg-green-900/20 block px-2 py-0.5 rounded">${escapeHtml(line)}</span>`;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        return `<span class="text-red-400 bg-red-900/20 block px-2 py-0.5 rounded">${escapeHtml(line)}</span>`;
      } else if (line.startsWith('@@')) {
        return `<span class="text-blue-400 bg-blue-900/20 block px-2 py-0.5 rounded font-medium">${escapeHtml(line)}</span>`;
      }
      return `<span class="text-gray-400">${escapeHtml(line)}</span>`;
    })
    .join('\n');
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Watch for version changes and clear diff
watch(() => props.versions, () => {
  clearDiff();
}, { deep: true });

// Keyboard shortcuts
watch(activeDiffIndex, (newIndex) => {
  if (newIndex !== null) {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearDiff();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }
});
</script>