<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Running Workflow: {{ workflow.name }}
      </h2>
      <div class="flex gap-2">
        <button 
          @click="$emit('cancel')"
          :disabled="isRunning"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button 
          @click="runWorkflow"
          :disabled="isRunning"
          class="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <template v-if="isRunning">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Executing...
          </template>
          <template v-else>
            Start Execution
          </template>
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Execution Progress -->
      <div class="lg:col-span-1">
        <h3 class="font-semibold mb-3">Execution Progress</h3>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div 
            v-for="step in workflow.steps"
            :key="step.id"
            :class="[
              'p-3 mb-2 rounded-lg border',
              results[step.id] 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : errors[step.id]
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ step.name }}</span>
              <Check v-if="results[step.id]" class="w-4 h-4 text-green-500" />
              <AlertCircle v-else-if="errors[step.id]" class="w-4 h-4 text-red-500" />
            </div>
            
            <div 
              v-if="getReferencedVariables(step.prompt).length > 0"
              class="text-xs mt-1 text-blue-600 dark:text-blue-400"
            >
              References: {{ getReferencedVariables(step.prompt).join(', ') }}
            </div>
            
            <div 
              v-if="results[step.id]"
              class="text-xs mt-2 text-gray-500 dark:text-gray-400 truncate"
            >
              Output: {{ results[step.id].substring(0, 50) }}...
            </div>
            
            <div 
              v-if="errors[step.id]"
              class="text-xs mt-2 text-red-500 truncate"
            >
              Error: {{ errors[step.id] }}
            </div>
          </div>
        </div>
        
        <!-- Template Variables Help -->
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Template Variables</h4>
          <div class="text-xs text-blue-700 dark:text-blue-300">
            Use <code v-pre>{{StepName}}</code> or <code v-pre>{{stepId}}</code> in prompts to reference previous step outputs.
          </div>
        </div>
      </div>
      
      <!-- Execution Log and Visualization -->
      <div class="lg:col-span-2">
        <h3 class="font-semibold mb-3">Execution Log</h3>
        <div class="bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-4 h-96 overflow-auto">
          <div v-if="executionLog.length === 0" class="text-gray-500 italic">
            No logs yet. Start execution to see logs.
          </div>
          <div v-else>
            <div v-for="(log, index) in executionLog" :key="index" class="mb-1">
              {{ log }}
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="font-semibold mb-3">Workflow Visualization</h3>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre class="text-sm whitespace-pre-wrap">{{ workflowDiagram }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertCircle, Check } from 'lucide-vue-next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Workflow, WorkflowExecution, WorkflowStep } from '../types/appTypes';
import { safeEval, safeProcess, generateWorkflowDiagram } from '../utils/workflowUtils';

interface Props {
  workflow: Workflow;
  apiKey: string;
  modelParams: {
    model: string;
    temperature: number;
    maxOutputTokens: number;
  };
}

interface Emits {
  (e: 'complete', execution: WorkflowExecution): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const results = ref<Record<string, string>>({});
const errors = ref<Record<string, string>>({});
const isRunning = ref(false);
const executionLog = ref<string[]>([]);

const workflowDiagram = computed(() => {
  const allConditions = props.workflow.steps.flatMap(s => s.conditions || []);
  return generateWorkflowDiagram(props.workflow.steps, allConditions);
});

const addLog = (message: string) => {
  executionLog.value.push(`${new Date().toLocaleTimeString()}: ${message}`);
  console.log(`${new Date().toLocaleTimeString()}: ${message}`)
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getReferencedVariables = (prompt: string): string[] => {
  const templateRegex = /{{([^}]+)}}/g;
  const matches = [];
  let match;
  
  while ((match = templateRegex.exec(prompt)) !== null) {
    matches.push(match[1].trim());
  }
  
  return [...new Set(matches)];
};

const processPromptTemplate = (prompt: string, currentResults: Record<string, string>): string => {
  let processedPrompt = prompt;
  
  Object.entries(currentResults).forEach(([stepId, output]) => {
    const step = props.workflow.steps.find(s => s.id === stepId);
    const stepName = step?.name || stepId;
    
    const stepNameRegex = new RegExp(`{{\\s*${escapeRegExp(stepName)}\\s*}}`, 'gi');
    processedPrompt = processedPrompt.replace(stepNameRegex, output);
    
    const stepIdRegex = new RegExp(`{{\\s*${escapeRegExp(stepId)}\\s*}}`, 'gi');
    processedPrompt = processedPrompt.replace(stepIdRegex, output);
  });
  
  return processedPrompt;
};

const areVariablesAvailable = (step: WorkflowStep, currentResults: Record<string, string>): boolean => {
  const referencedVars = getReferencedVariables(step.prompt);
  
  if (referencedVars.length === 0) {
    return true;
  }
  
  return referencedVars.every(varName => {
    const matchingStep = props.workflow.steps.find(s => 
      s.name.toLowerCase() === varName.toLowerCase() || 
      s.id === varName
    );
    
    return matchingStep && currentResults[matchingStep.id];
  });
};

const executeStep = async (step: WorkflowStep, currentResults: Record<string, string>) => {
  addLog(`Starting step: ${step.name}`);
  
  const referencedVars = getReferencedVariables(step.prompt);
  if (referencedVars.length > 0) {
    addLog(`Step references variables: ${referencedVars.join(', ')}`);
    
    if (!areVariablesAvailable(step, currentResults)) {
      const unavailableVars = referencedVars.filter(varName => {
        const matchingStep = props.workflow.steps.find(s => 
          s.name.toLowerCase() === varName.toLowerCase() || 
          s.id === varName
        );
        return !matchingStep || !currentResults[matchingStep.id];
      });
      
      throw new Error(`Referenced variables not available: ${unavailableVars.join(', ')}`);
    }
  }
  
  try {
    const processedPrompt = processPromptTemplate(step.prompt, currentResults);
    
    if (processedPrompt !== step.prompt) {
      addLog(`Template variables processed for step: ${step.name}`);
    }
    
    const genAI = new GoogleGenerativeAI(props.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: props.modelParams.model,
      generationConfig: {
        temperature: props.modelParams.temperature,
        maxOutputTokens: props.modelParams.maxOutputTokens
      }
    });
    
    const generationResult = await model.generateContent(processedPrompt);
    let output = await generationResult.response.text();
    
    // Process output if processor exists
    if (step.outputProcessor) {
      addLog(`Processing output for step: ${step.name}`);
      try {
        const processedOutput = safeProcess(
          step.outputProcessor, 
          { 
            output, 
            results: currentResults,
            stepId: step.id
          }
        );
        
        // Ensure output is string
        if (typeof processedOutput !== 'string') {
          output = JSON.stringify(processedOutput);
          addLog(`Output processor returned non-string value. Converted to JSON string.`);
        } else {
          output = processedOutput;
        }
      } catch (error: any) {
        addLog(`Output processing failed: ${error.message}`);
        throw new Error(`Output processing failed: ${error.message}`);
      }
    }
    
    addLog(`Completed step: ${step.name}`);
    return output;
  } catch (error: any) {
    addLog(`Error in step ${step.name}: ${error.message}`);
    throw error;
  }
};

const canExecuteStep = (step: WorkflowStep, currentResults: Record<string, string>, visited: Set<string>): boolean => {
  if (visited.has(step.id)) {
    return false;
  }
  
  return areVariablesAvailable(step, currentResults);
};

const getReadySteps = (availableSteps: WorkflowStep[], currentResults: Record<string, string>, visited: Set<string>): WorkflowStep[] => {
  return availableSteps.filter(step => canExecuteStep(step, currentResults, visited));
};

// Helper function to process step conditions and update execution queue
const processStepConditions = (
  step: WorkflowStep, 
  output: string, 
  currentResults: Record<string, string>, 
  executionQueue: Set<string>, 
  visited: Set<string>
) => {
  if (step.conditions && step.conditions.length > 0) {
    addLog(`Evaluating ${step.conditions.length} conditions for step: ${step.name}`);
    
    for (const condition of step.conditions) {
      try {
        const result = safeEval(condition.expression, { 
          output, 
          results: currentResults,
          stepId: step.id
        });
        
        addLog(
          `Condition evaluated: ${condition.description}\n` +
          `Expression: ${condition.expression}\n` +
          `Result: ${result}`
        );
        
        const targetStepId = result ? condition.trueTargetStepId : condition.falseTargetStepId;
        
        if (targetStepId && !visited.has(targetStepId)) {
          const targetStep = props.workflow.steps.find(s => s.id === targetStepId);
          if (targetStep) {
            executionQueue.add(targetStepId); // Add to execution queue
            addLog(`Condition result: ${result} -> Queued step: ${targetStep.name}`);
          } else {
            addLog(`No target step found for ID: ${targetStepId}`);
          }
        } else if (targetStepId) {
          addLog(`Target step ${targetStepId} already executed, skipping`);
        } else {
          addLog(`No target step defined for condition result: ${result} - stopping branch`);
        }
      } catch (error: any) {
        addLog(
          `Condition evaluation failed: ${condition.description}\n` +
          `Expression: ${condition.expression}\n` +
          `Error: ${error.message}`
        );
      }
    }
  }
};

const runWorkflow = async () => {
  if (!props.workflow.steps.length) return;
  
  isRunning.value = true;
  results.value = {};
  errors.value = {};
  executionLog.value = [];
  addLog("Workflow execution started");
  
  try {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      createdAt: new Date(),
      steps: []
    };
    
    // Find starting steps (no incoming conditions and no template dependencies)
    const startingSteps = props.workflow.steps.filter(step => {
      const hasIncoming = props.workflow.steps.some(s => 
        s.conditions?.some(c => c.trueTargetStepId === step.id || c.falseTargetStepId === step.id)
      );
      const hasTemplateDependencies = getReferencedVariables(step.prompt).length > 0;
      return !hasIncoming && !hasTemplateDependencies;
    });
    
    addLog(`Found ${startingSteps.length} starting steps`);
    
    const visited = new Set<string>();
    const currentResults: Record<string, string> = {};
    
    // Initialize execution queue with starting steps
    const executionQueue: Set<string> = new Set(startingSteps.map(s => s.id));
    let executionRound = 1;
    
    while (executionQueue.size > 0 && visited.size < props.workflow.steps.length) {
      addLog(`Starting execution round ${executionRound}`);
      
      // Get steps that are both queued AND ready (dependencies met)
      const stepsToExecute = Array.from(executionQueue)
        .map(stepId => props.workflow.steps.find(s => s.id === stepId))
        .filter((step): step is WorkflowStep => step !== undefined && canExecuteStep(step, currentResults, visited));
      
      if (stepsToExecute.length === 0) {
        // Check if we have queued steps that aren't ready due to dependencies
        const queuedSteps = Array.from(executionQueue)
          .map(stepId => props.workflow.steps.find(s => s.id === stepId))
          .filter((step): step is WorkflowStep => step !== undefined && !visited.has(step.id));
        
        if (queuedSteps.length > 0) {
          const stepNames = queuedSteps.map(s => s.name).join(', ');
          addLog(`Queued steps waiting for dependencies: ${stepNames}`);
          
          // Try to execute one step with unmet dependencies (fallback)
          const nextStep = queuedSteps[0];
          if (nextStep) {
            addLog(`Attempting to execute queued step with unmet dependencies: ${nextStep.name}`);
            
            try {
              const output = await executeStep(nextStep, currentResults);
              currentResults[nextStep.id] = output;
              results.value = { ...results.value, [nextStep.id]: output };
              visited.add(nextStep.id);
              executionQueue.delete(nextStep.id); // Remove from queue
              
              execution.steps.push({
                stepId: nextStep.id,
                input: nextStep.prompt,
                output,
                executedAt: new Date(),
                success: true
              });
              
              // Process conditions and add next steps to queue
              processStepConditions(nextStep, output, currentResults, executionQueue, visited);
              
            } catch (error: any) {
              errors.value = { ...errors.value, [nextStep.id]: error.message };
              visited.add(nextStep.id);
              executionQueue.delete(nextStep.id);
              
              execution.steps.push({
                stepId: nextStep.id,
                input: nextStep.prompt,
                output: error.message,
                executedAt: new Date(),
                success: false
              });
              
              addLog(`Failed to execute queued step: ${nextStep.name} - ${error.message}`);
            }
          }
        } else {
          addLog("No more steps to execute");
          break;
        }
      } else {
        // Execute all ready steps that are in the queue
        for (const step of stepsToExecute) {
          try {
            const output = await executeStep(step, currentResults);
            currentResults[step.id] = output;
            results.value = { ...results.value, [step.id]: output };
            visited.add(step.id);
            executionQueue.delete(step.id); // Remove from queue after execution
            
            execution.steps.push({
              stepId: step.id,
              input: processPromptTemplate(step.prompt, currentResults),
              output,
              executedAt: new Date(),
              success: true
            });
            
            // Process conditions and add next steps to queue
            processStepConditions(step, output, currentResults, executionQueue, visited);
            
          } catch (error: any) {
            errors.value = { ...errors.value, [step.id]: error.message };
            visited.add(step.id);
            executionQueue.delete(step.id);
            
            execution.steps.push({
              stepId: step.id,
              input: step.prompt,
              output: error.message,
              executedAt: new Date(),
              success: false
            });
            
            addLog(`Error in step ${step.name}: ${error.message}`);
          }
        }
      }
      
      executionRound++;
      
      if (executionRound > props.workflow.steps.length + 5) {
        addLog("Maximum execution rounds reached, stopping workflow");
        break;
      }
    }
    
    addLog(`Workflow execution completed. Executed ${visited.size}/${props.workflow.steps.length} steps`);
    emit('complete', execution);
    
  } catch (error: any) {
    addLog(`Workflow failed: ${error.message}`);
  } finally {
    isRunning.value = false;
  }
};
</script>