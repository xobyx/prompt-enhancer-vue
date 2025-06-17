<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ workflow.id ? "Edit Workflow" : "Create New Workflow" }}
      </h2>
      <div class="flex gap-2">
        <button 
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button 
          @click="$emit('save')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Save Workflow
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main workflow area -->
      <div class="lg:col-span-2">
        <!-- Workflow name -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Workflow Name</label>
          <input
            :value="workflow.name"
            @input="updateWorkflowName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <!-- Workflow diagram -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 overflow-auto relative border border-gray-200 dark:border-gray-700">
          <!-- Steps -->
          <div 
            v-for="step in workflow.steps"
            :key="step.id"
            :class="[
              'absolute bg-white dark:bg-gray-700 border-2 rounded-lg p-4 w-64 cursor-pointer transition-all',
              selectedStep?.id === step.id 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-300 dark:border-gray-600'
            ]"
            :style="{ left: step.position.x + 'px', top: step.position.y + 'px' }"
            @click="selectedStep = step"
          >
            <div class="flex justify-between">
              <h3 class="font-semibold truncate">{{ step.name }}</h3>
              <button 
                @click.stop="handleDeleteStep(step.id)"
                class="text-red-500 hover:text-red-700"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ step.prompt.substring(0, 50) }}...
            </div>
            <div v-if="step.conditions && step.conditions.length > 0" class="mt-2 text-xs text-blue-500">
              {{ step.conditions.length }} condition{{ step.conditions.length === 1 ? '' : 's' }}
            </div>
          </div>
          
          <!-- Condition arrows -->
          <template v-for="step in workflow.steps" :key="'conditions-' + step.id">
            <template v-for="condition in step.conditions" :key="condition.id">
              <div v-if="getStepById(condition.sourceStepId) && getStepById(condition.targetStepId)" class="absolute pointer-events-none">
                <svg 
                  class="absolute top-0 left-0 w-full h-full"
                  style="overflow: visible"
                >
                  <line 
                    :x1="getStepById(condition.sourceStepId)!.position.x + 100" 
                    :y1="getStepById(condition.sourceStepId)!.position.y + 20" 
                    :x2="getStepById(condition.targetStepId)!.position.x" 
                    :y2="getStepById(condition.targetStepId)!.position.y + 20"
                    stroke="#94a3b8" 
                    stroke-width="2" 
                    marker-end="url(#arrowhead)"
                  />
                </svg>
                <div 
                  class="absolute bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                  :style="{ 
                    left: (getStepById(condition.sourceStepId)!.position.x + getStepById(condition.targetStepId)!.position.x) / 2 + 'px', 
                    top: (getStepById(condition.sourceStepId)!.position.y + getStepById(condition.targetStepId)!.position.y) / 2 + 'px'
                  }"
                >
                  {{ condition.description }}
                </div>
              </div>
            </template>
          </template>
          
          <!-- Arrow marker definition -->
          <svg style="position: absolute; width: 0; height: 0">
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="10" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>
        
        <button 
          @click="handleAddStep"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus class="w-4 h-4" /> Add Step
        </button>
      </div>
      
      <!-- Step configuration panel -->
      <div class="lg:col-span-1">
        <div v-if="selectedStep" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-4">Step Configuration</h3>
          
          <!-- Step name -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Step Name</label>
            <input
              v-model="selectedStep.name"
              @input="handleUpdateStep(selectedStep)"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <!-- Prompt content -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Prompt Content</label>
            <textarea
              v-model="selectedStep.prompt"
              @input="handleUpdateStep(selectedStep)"
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Enter your prompt content here..."
            />
          </div>
          
          <!-- Position -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Position</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="selectedStep.position.x"
                @input="handleUpdateStep(selectedStep)"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="X"
              />
              <input
                v-model.number="selectedStep.position.y"
                @input="handleUpdateStep(selectedStep)"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Y"
              />
            </div>
          </div>
          
          <!-- Conditions -->
          <div class="mt-6">
            <h4 class="font-medium mb-3">Conditions</h4>
            
            <!-- Existing conditions -->
            <div v-for="condition in selectedStep.conditions" :key="condition.id" class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2">
              <div class="flex justify-between">
                <span class="font-medium">{{ condition.description }}</span>
                <button 
                  @click="handleDeleteCondition(condition.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <div class="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {{ condition.expression }}
              </div>
              <div class="text-xs mt-1 text-blue-500">
                To: {{ getStepById(condition.targetStepId)?.name || 'Unknown' }}
              </div>
            </div>
            
            <!-- Add condition button or form -->
            <button 
              v-if="!newCondition"
              @click="handleAddCondition"
              class="w-full mt-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus class="w-4 h-4" /> Add Condition
            </button>
            
            <!-- New condition form -->
            <div v-else class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h4 class="font-medium mb-2">New Condition</h4>
              
              <div class="mb-3">
                <label class="block text-sm mb-1">Target Step</label>
                <select
                  v-model="newCondition.targetStepId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select target step</option>
                  <option 
                    v-for="step in workflow.steps.filter(s => s.id !== selectedStep?.id)"
                    :key="step.id" 
                    :value="step.id"
                  >
                    {{ step.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="block text-sm mb-1">Condition Template</label>
                <select
                  @change="handleTemplateSelect"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a template</option>
                  <option 
                    v-for="template in conditionTemplates"
                    :key="template.id" 
                    :value="template.id"
                  >
                    {{ template.name }}
                  </option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="block text-sm mb-1">Condition Expression</label>
                <input
                  v-model="newCondition.expression"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="JavaScript expression returning boolean"
                />
              </div>
              
              <div class="mb-3">
                <label class="block text-sm mb-1">Description</label>
                <input
                  v-model="newCondition.description"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Human-readable description"
                />
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="newCondition = null"
                  class="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  @click="handleSaveCondition"
                  :disabled="!newCondition.targetStepId || !newCondition.expression"
                  class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  Save Condition
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No step selected -->
        <div v-else class="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <ListTree class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-4 font-medium">No Step Selected</h3>
          <p class="text-sm text-gray-500 mt-2">
            Select a step from the diagram to configure its prompt and conditions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Plus, ListTree, GitBranch } from 'lucide-vue-next';
import { Workflow, WorkflowStep, _Condition } from '../types/appTypes';
import type { conditionTemplates } from '../constants/conditionTemplates';

interface Props {
  workflow: Workflow;
}

interface Emits {
  (e: 'update', workflow: Workflow): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedStep = ref<WorkflowStep | null>(null);
const newCondition = ref<Omit<Condition, 'id'> | null>(null);

const updateWorkflowName = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update', { ...props.workflow, name: target.value });
};

const handleAddStep = () => {
  const newStep: WorkflowStep = {
    id: `step-${Date.now()}`,
    name: `Step ${props.workflow.steps.length + 1}`,
    prompt: '',
    position: { x: 100, y: 100 + (props.workflow.steps.length * 120) }
  };
  emit('update', { ...props.workflow, steps: [...props.workflow.steps, newStep] });
};

const handleUpdateStep = (step: WorkflowStep) => {
  emit('update', {
    ...props.workflow,
    steps: props.workflow.steps.map(s => s.id === step.id ? step : s)
  });
};

const handleDeleteStep = (id: string) => {
  const updatedSteps = props.workflow.steps.filter(s => s.id !== id);
  const updatedWorkflow = {
    ...props.workflow,
    steps: updatedSteps.map(step => ({
      ...step,
      conditions: step.conditions?.filter(c => 
        c.sourceStepId !== id && c.targetStepId !== id
      )
    }))
  };
  
  emit('update', updatedWorkflow);
  if (selectedStep.value?.id === id) selectedStep.value = null;
};

const handleAddCondition = () => {
  if (!selectedStep.value) return;
  newCondition.value = {
    sourceStepId: selectedStep.value.id,
    targetStepId: '',
    expression: '',
    description: ''
  };
};

const handleDeleteCondition = (conditionId: string) => {
  if (!selectedStep.value) return;
  
  const updatedStep = {
    ...selectedStep.value,
    conditions: selectedStep.value.conditions?.filter(c => c.id !== conditionId)
  };
  
  selectedStep.value = updatedStep;
  handleUpdateStep(updatedStep);
};

const handleTemplateSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const template = conditionTemplates.find(t => t.id === target.value);
  if (template && newCondition.value) {
    newCondition.value = {
      ...newCondition.value,
      expression: template.expression,
      description: template.description
    };
  }
};

const handleSaveCondition = () => {
  if (!newCondition.value || !newCondition.value.targetStepId || !newCondition.value.expression || !selectedStep.value) return;
  
  const condition: Condition = {
    ...newCondition.value,
    id: `cond-${Date.now()}`
  };
  
  const updatedStep = {
    ...selectedStep.value,
    conditions: [...(selectedStep.value.conditions || []), condition]
  };
  
  selectedStep.value = updatedStep;
  handleUpdateStep(updatedStep);
  newCondition.value = null;
};

const getStepById = (id: string): WorkflowStep | undefined => {
  return props.workflow.steps.find(s => s.id === id);
};
</script>

