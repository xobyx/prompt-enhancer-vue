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
          <!-- SVG for arrows -->
          <svg 
            class="absolute top-0 left-0 w-full h-full pointer-events-none"
            style="z-index: 1;"
          >
            <defs>
              <marker 
                id="arrowhead-true" 
                markerWidth="10" 
                markerHeight="7" 
                refX="10" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <marker 
                id="arrowhead-false" 
                markerWidth="10" 
                markerHeight="7" 
                refX="10" 
                refY="3.5" 
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>
            
            <!-- Condition arrows -->
            <template v-for="step in workflow.steps" :key="'conditions-' + step.id">
              <template v-for="(condition, index) in (step.conditions || [])" :key="condition.id">
                <!-- True path arrow -->
                <g v-if="getStepById(condition.trueTargetStepId)">
                  <line 
                    :x1="step.position.x + 264" 
                    :y1="step.position.y + 40" 
                    :x2="getStepById(condition.trueTargetStepId)?.position.x || 0"
                    :y2="(getStepById(condition.trueTargetStepId)?.position.y || 0) + 40"
                    stroke="#10b981" 
                    stroke-width="2" 
                    marker-end="url(#arrowhead-true)"
                  />
                  <!-- True condition label -->
                  <text 
                    :x="(step.position.x + 264 + (getStepById(condition.trueTargetStepId)?.position.x || 0)) / 2"
                    :y="step.position.y + 35"
                    class="fill-green-600 text-xs"
                    text-anchor="middle"
                  >
                    ✓ {{ condition.description }}
                  </text>
                </g>
                
                <!-- False path arrow -->
                <g v-if="condition.falseTargetStepId && getStepById(condition.falseTargetStepId)">
                  <line 
                    :x1="step.position.x + 264" 
                    :y1="step.position.y + 60" 
                    :x2="getStepById(condition.falseTargetStepId)?.position.x || 0"
                    :y2="(getStepById(condition.falseTargetStepId)?.position.y || 0) + 60"
                    stroke="#ef4444" 
                    stroke-width="2" 
                    marker-end="url(#arrowhead-false)"
                  />
                  <!-- False condition label -->
                  <text 
                    :x="(step.position.x + 264 + (getStepById(condition.falseTargetStepId)?.position.x || 0)) / 2"
                    :y="step.position.y + 80"
                    class="fill-red-600 text-xs"
                    text-anchor="middle"
                  >
                    ✗ {{ condition.description }}
                  </text>
                </g>
              </template>
            </template>
          </svg>
          
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
            :style="{ 
              left: step.position.x + 'px', 
              top: step.position.y + 'px',
              zIndex: 10
            }"
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
              {{ step.prompt ? step.prompt.substring(0, 50) + '...' : 'No prompt set' }}
            </div>
            <div v-if="step.conditions && step.conditions.length > 0" class="mt-2 text-xs text-blue-500">
              {{ step.conditions.length }} condition{{ step.conditions.length === 1 ? '' : 's' }}
            </div>
            <div v-if="step.outputProcessor" class="mt-2 text-xs text-purple-500">
              Output Processor
            </div>
          </div>
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
          
          <!-- Output processor -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Output Processor (Optional)</label>
            <textarea
              v-model="selectedStep.outputProcessor"
              @input="handleUpdateStep(selectedStep)"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
              placeholder="JavaScript expression to modify output. Use 'output' for step result. Example: output.toUpperCase()"
            />
            <p class="text-xs text-gray-500 mt-1">
              This expression will process the step's output before passing to next steps.
            </p>
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
            <div 
              v-for="condition in selectedStep.conditions || []" 
              :key="condition.id" 
              class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2"
            >
              <div class="flex justify-between">
                <span class="font-medium">{{ condition.description }}</span>
                <button 
                  @click="handleDeleteCondition(condition.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-1 mt-2">
                <div class="text-xs text-green-600 dark:text-green-400">
                  ✓ {{ getStepById(condition.trueTargetStepId)?.name || '?' }}
                </div>
                <div class="text-xs text-red-600 dark:text-red-400">
                  ✗ {{ condition.falseTargetStepId ? (getStepById(condition.falseTargetStepId)?.name || '?') : 'Stop' }}
                </div>
              </div>
              
              <div class="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {{ condition.expression }}
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
                <label class="block text-sm mb-1">On True, go to:</label>
                <select
                  v-model="newCondition.trueTargetStepId"
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
                <label class="block text-sm mb-1">On False, go to (optional):</label>
                <select
                  v-model="newCondition.falseTargetStepId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option :value="null">Stop execution (no next step)</option>
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
                  @change="handleTemplateSelect($event)"
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
                  :disabled="!newCondition.trueTargetStepId || !newCondition.expression"
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
import { ref } from 'vue';
import { X, Plus, ListTree } from 'lucide-vue-next';
import type { Workflow, WorkflowStep, Condition } from '../types/appTypes';
import { conditionTemplates } from '../constants/conditionTemplates';

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
const newCondition = ref<Omit<Condition, 'id' | 'sourceStepId'> | null>(null);

const updateWorkflowName = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update', { ...props.workflow, name: target.value });
};

const handleAddStep = () => {
  const newStep: WorkflowStep = {
    id: `step-${Date.now()}`,
    name: `Step ${props.workflow.steps.length + 1}`,
    prompt: '',
    outputProcessor: '',
    position: { x: 100, y: 100 + (props.workflow.steps.length * 120) },
    conditions: []
  };
  emit('update', { ...props.workflow, steps: [...props.workflow.steps, newStep] });
  selectedStep.value = newStep;
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
      conditions: (step.conditions || []).filter(c => 
        c.sourceStepId !== id && 
        c.trueTargetStepId !== id && 
        c.falseTargetStepId !== id
      )
    }))
  };
  
  emit('update', updatedWorkflow);
  if (selectedStep.value?.id === id) selectedStep.value = null;
};

const handleAddCondition = () => {
  if (!selectedStep.value) return;
  newCondition.value = {
    trueTargetStepId: '',
    falseTargetStepId: null,
    expression: '',
    description: ''
  };
};

const handleDeleteCondition = (conditionId: string) => {
  if (!selectedStep.value) return;
  
  const updatedStep = {
    ...selectedStep.value,
    conditions: (selectedStep.value.conditions || []).filter(c => c.id !== conditionId)
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
  if (!newCondition.value || 
      !newCondition.value.trueTargetStepId || 
      !newCondition.value.expression || 
      !selectedStep.value) {
    return;
  }
  
  const condition: Condition = {
    ...newCondition.value,
    id: `cond-${Date.now()}`,
    sourceStepId: selectedStep.value.id
  };
  
  const updatedStep = {
    ...selectedStep.value,
    conditions: [...(selectedStep.value.conditions || []), condition]
  };
  
  selectedStep.value = updatedStep;
  handleUpdateStep(updatedStep);
  newCondition.value = null;
};

const getStepById = (id: string| null): WorkflowStep | undefined => {
  return props.workflow.steps.find(s => s.id === id);
};
</script>