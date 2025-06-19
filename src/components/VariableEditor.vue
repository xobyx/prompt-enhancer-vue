<!-- components/VariableEditor.vue -->
<template>
  <div class="variable-editor border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-6 overflow-hidden max-w-full -mx-2 sm:mx-0">
    <h3 class="font-semibold mb-3 text-lg text-gray-900 dark:text-gray-100">Prompt Variables</h3>
    
    <!-- Mobile-first responsive layout -->
    <div v-for="(varDef, index) in variableDefinitions" :key="index" class="mb-4 sm:mb-2">
      <!-- Mobile: Stack vertically -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 min-w-0">
        <input
          :value="varDef.name"
          @input="updateVariableName(index, ($event.target as HTMLInputElement)?.value || '')"
          placeholder="Variable name"
          class="w-full sm:flex-1 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
        />
        <input
          :value="varDef.defaultValue"
          @input="updateVariableValue(index, ($event.target as HTMLInputElement)?.value || '')"
          placeholder="Default value"
          class="w-full sm:flex-1 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
        />
        <button 
          @click="removeVariable(index)"
          class="self-end sm:self-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors w-10 h-10 flex items-center justify-center flex-shrink-0"
          :aria-label="`Remove variable ${varDef.name || 'unnamed'}`"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <button 
      @click="addVariable"
      class="mt-3 flex items-center justify-center sm:justify-start w-full sm:w-auto p-2 sm:p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
    >
      <Plus class="w-4 h-4 mr-1" /> Add Variable
    </button>
    
    <div class="mt-6">
      <h4 class="font-medium mb-2 text-base">Preview with Variables Applied:</h4>
      <div class="relative border rounded overflow-hidden">
        <pre class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 text-xs sm:text-sm max-h-40 sm:max-h-60 overflow-auto whitespace-pre-wrap break-words w-full">{{ appliedPromptPreview }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { useAppStore } from '../stores/app';

const store = useAppStore();

// Fixed: Access reactive properties correctly
const variableDefinitions = computed(() => store.variableDefinitions);
const appliedPromptPreview = computed(() => 
  store.applyVariables(store.inputPrompt)
);

const addVariable = () => {
  // Fixed: Call store method properly
  store.addVariable(`var${store.variableDefinitions.length + 1}`, '');
};

const removeVariable = (index: number) => {
  const varDef = store.variableDefinitions[index];
  if (varDef) {
    // Remove from variables object
    delete store.variables[varDef.name];
    // Remove from definitions array
    store.variableDefinitions.splice(index, 1);
  }
};

const updateVariableName = (index: number, newName: string) => {
  const varDef = store.variableDefinitions[index];
  if (varDef && varDef.name !== newName) {
    const oldName = varDef.name;
    const currentValue = store.variables[oldName] || varDef.defaultValue;
    
    // Update the definition
    varDef.name = newName;
    
    // Update variables object
    if (oldName && store.variables[oldName] !== undefined) {
      delete store.variables[oldName];
    }
    store.variables[newName] = currentValue;
  }
};

const updateVariableValue = (index: number, newValue: string) => {
  const varDef = store.variableDefinitions[index];
  if (varDef) {
    // Update default value
    varDef.defaultValue = newValue;
    // Update current value in variables
    store.variables[varDef.name] = newValue;
  }
};
</script>