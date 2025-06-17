<template>
  <div>
    <!-- Mobile overlay -->
    <div 
      :class="[
        'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      ]"
      @click="$emit('close')"
    />
    
    <!-- Sidebar -->
    <div 
      :class="[
        'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-full max-w-xs z-50 transform transition-transform shadow-xl',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0 md:max-w-xs md:flex md:flex-col md:border-r md:dark:border-gray-700'
      ]"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 md:hidden"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <!-- New project form -->
      <div class="p-4">
        <div class="flex gap-2">
          <input
            v-model="newProjectName"
            type="text"
            placeholder="New project name"
            class="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            @keydown.enter="handleCreateProject"
          />
          <button 
            @click="handleCreateProject" 
            :disabled="!newProjectName.trim()"
            class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Projects list -->
      <nav class="flex-grow overflow-y-auto p-4 space-y-2">
        <a
          v-for="project in projects"
          :key="project.id"
          href="#"
          :class="[
            'block p-3 rounded-lg text-left transition-colors',
            activeProjectId === project.id 
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          ]"
          @click.prevent="handleSelectProject(project.id)"
        >
          <p class="truncate">{{ project.name }}</p>
          <div class="flex justify-between text-xs opacity-60 mt-1">
            <span>{{ project.history.length }} prompt{{ project.history.length === 1 ? '' : 's' }}</span>
            <span>{{ project.workflows.length }} workflow{{ project.workflows.length === 1 ? '' : 's' }}</span>
          </div>
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LayoutGrid, X, Plus } from 'lucide-vue-next';
import type { Project } from '../types/appTypes';

interface Props {
  projects: Project[];
  activeProjectId: string | null;
  isOpen: boolean;
}

interface Emits {
  (e: 'selectProject', id: string): void;
  (e: 'createProject', name: string): void;
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const newProjectName = ref('');

const handleCreateProject = () => {
  if (newProjectName.value.trim()) {
    emit('createProject', newProjectName.value.trim());
    newProjectName.value = '';
  }
};

const handleSelectProject = (id: string) => {
  emit('selectProject', id);
  emit('close');
};
</script>

