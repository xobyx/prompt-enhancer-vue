import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  Project, PromptVariant, ModelParameters, ComparisonResult,
  Workflow, WorkflowExecution, PromptHistoryItem
} from '../types/appTypes';
import { 
  getApiKey, loadProjects, saveProjects, getActiveProjectId, 
  setActiveProjectId, getDarkModePreference, setDarkModePreference 
} from '../utils/storageUtils';

export const useAppStore = defineStore('app', () => {
  // State
  const apiKey = ref(getApiKey());
  const inputPrompt = ref('');
  const selectedVersion = ref('comprehensive');
  const loading = ref(false);
  const result = ref<any>(null);
  const error = ref('');
  const projects = ref<Project[]>(loadProjects());
  const activeProjectId = ref<string | null>(getActiveProjectId());
  const isSidebarOpen = ref(false);
  const isHistoryPanelOpen = ref(false);
  const modelParams = ref<ModelParameters>({
    model: 'gemini-2.5-flash-preview-04-17',
    temperature: 0.7,
    maxOutputTokens: 8192,
  });
  const questionAnswers = ref<Record<string, string>>({});
  const showQuestionForm = ref(false);
  const selectedVariantsForComparison = ref<string[]>([]);
  const comparisonResults = ref<ComparisonResult[]>([]);
  const isComparing = ref(false);
  const copied = ref('');
  const darkMode = ref(getDarkModePreference());
  const activeWorkflow = ref<Workflow | null>(null);
  const isEditingWorkflow = ref(false);
  const isRunningWorkflow = ref(false);
  const view = ref<'prompt' | 'workflows' | 'reverse-engineering'>('prompt');
  const workflowHistory = ref<WorkflowExecution | null>(null);

  // app.ts
  const variables = ref<Record<string, string>>({});
  const variableDefinitions = ref<Array<{name: string, defaultValue: string}>>([]);
  
  const addVariable = (name: string, defaultValue: string = '') => {
    variableDefinitions.value.push({ name, defaultValue });
    variables.value[name] = defaultValue;
  };
  
  const applyVariables = (prompt: string) => {
    return prompt.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables.value[varName] || match;
    });
  };
  // Computed
  const activeProject = computed(() => 
    projects.value.find(p => p.id === activeProjectId.value)
  );
  
  const promptHistory = computed(() => 
    activeProject.value?.history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) || []
  );

  const variants = computed(() => 
    result.value?.generatedPrompts || result.value?.enhanced_variants || result.value?.engineered_variants || result.value?.optimized_variants || []
  );

  const questions = computed(() => 
    result.value?.questions || result.value?.clarifying_questions || result.value?.clarification_needed || result.value?.efficiency_questions || []
  );

  // Actions
  const initializeProjects = () => {
    if (projects.value.length === 0) {
      const defaultProjectId = Date.now().toString();
      const defaultProject: Project = { 
        id: defaultProjectId, 
        name: "Default Project", 
        createdAt: new Date(), 
        history: [],
        workflows: [] 
      };
      projects.value = [defaultProject];
      activeProjectId.value = defaultProjectId;
    }
  };

  const savePreferences = () => {
    setDarkModePreference(darkMode.value);
    if (apiKey.value) localStorage.setItem('gemini_api_key', apiKey.value);
  };

  const saveProjectsToStorage = () => {
    saveProjects(projects.value);
    if (activeProjectId.value) {
      setActiveProjectId(activeProjectId.value);
    }
  };

  const createProject = (name: string) => {
    const newProject: Project = { 
      id: Date.now().toString(), 
      name, 
      createdAt: new Date(), 
      history: [],
      workflows: []
    };
    projects.value = [newProject, ...projects.value];
    activeProjectId.value = newProject.id;
  };

  const selectProject = (id: string) => {
    activeProjectId.value = id;
    result.value = null;
    inputPrompt.value = '';
    selectedVariantsForComparison.value = [];
    comparisonResults.value = [];
  };

  const addToHistory = (historyItem: PromptHistoryItem) => {
    console.log("addToHistory",historyItem)
    if (!activeProject.value) return;
    
    const updatedProject: Project = {
      ...activeProject.value,
      history: [historyItem, ...activeProject.value.history]
    };
    
    projects.value = projects.value.map(p => 
      p.id === activeProjectId.value ? updatedProject : p
    );
  };
  const updateHistoryx= (historyItem: PromptHistoryItem) => {
    if (!activeProject.value) return;
    activeProject.value.history.map(h=>
      h.id===historyItem.id?historyItem:h
    );
    
  }
  const updateHistory = (historyItem: PromptHistoryItem) => {
    console.log("updateHistory",historyItem)
    if (!activeProject.value) return;
    
    const updatedProject: Project = {
      ...activeProject.value,
      history: activeProject.value.history.map(h =>
        h.inputPrompt === historyItem.inputPrompt ? historyItem : h
      )
    };
    
    projects.value = projects.value.map(p => 
      p.id === activeProjectId.value ? updatedProject : p
    );
    
    saveProjectsToStorage();
  };
  const loadFromHistory = (historyItem: PromptHistoryItem) => {
    inputPrompt.value = historyItem.inputPrompt;
    selectedVersion.value = historyItem.version;
    result.value = historyItem.result;
    isHistoryPanelOpen.value = false;
    selectedVariantsForComparison.value = [];
    comparisonResults.value = [];
    showQuestionForm.value = false;
    questionAnswers.value = historyItem.questionAnswers || {};
  };

  const resetForm = () => {
    inputPrompt.value = '';
    result.value = null;
    error.value = '';
    selectedVariantsForComparison.value = [];
    comparisonResults.value = [];
    showQuestionForm.value = false;
    questionAnswers.value = {};
  };

  const toggleVariantForComparison = (variantId: string) => {
    const index = selectedVariantsForComparison.value.indexOf(variantId);
    if (index > -1) {
      selectedVariantsForComparison.value.splice(index, 1);
    } else {
      selectedVariantsForComparison.value.push(variantId);
    }
  };

  const createWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: "New Workflow",
      steps: [],
      createdAt: new Date(),
      executions: []
    };
    activeWorkflow.value = newWorkflow;
    isEditingWorkflow.value = true;
  };

  const saveWorkflow = () => {
    if (!activeWorkflow.value || !activeProject.value) return;
    
    const updatedProject: Project = {
      ...activeProject.value,
      workflows: [
        ...activeProject.value.workflows.filter(w => w.id !== activeWorkflow.value!.id),
        activeWorkflow.value
      ]
    };
    
    projects.value = projects.value.map(p => 
      p.id === activeProjectId.value ? updatedProject : p
    );
    isEditingWorkflow.value = false;
    activeWorkflow.value = null;
  };

  const runWorkflow = (workflow: Workflow) => {
    activeWorkflow.value = workflow;
    isRunningWorkflow.value = true;
  };

  const completeWorkflow = (execution: WorkflowExecution) => {
    if (!activeWorkflow.value || !activeProject.value) return;
    
    const updatedWorkflow = {
      ...activeWorkflow.value,
      executions: [...(activeWorkflow.value.executions || []), execution]
    };
    
    const updatedProject = {
      ...activeProject.value,
      workflows: activeProject.value.workflows.map(w => 
        w.id === activeWorkflow.value!.id ? updatedWorkflow : w
      )
    };
    
    projects.value = projects.value.map(p => 
      p.id === activeProjectId.value ? updatedProject : p
    );
    isRunningWorkflow.value = false;
    activeWorkflow.value = updatedWorkflow;
    workflowHistory.value = execution;
  };
  const editingPromptId=ref<string>('');
  const editedPromptContent=ref<string>('');
  const testInput=ref<string>('');
  const testResults=ref<Record<string, {
      input: string;
      output: string;
      error?: string;
      timestamp: Date;
  }>>({});
  const testingPromptIds=ref<string[]>([]);
  return {
    editingPromptId,
    editedPromptContent,
    testInput,
    testResults,
    testingPromptIds,
    // State
    apiKey,
    inputPrompt,
    selectedVersion,
    loading,
    result,
    error,
    projects,
    activeProjectId,
    isSidebarOpen,
    isHistoryPanelOpen,
    modelParams,
    questionAnswers,
    showQuestionForm,
    selectedVariantsForComparison,
    comparisonResults,
    isComparing,
    copied,
    darkMode,
    activeWorkflow,
    isEditingWorkflow,
    isRunningWorkflow,
    view,
    workflowHistory,
    
    // Computed
    activeProject,
    promptHistory,
    variants,
    questions,
    
    // Actions
    initializeProjects,
    savePreferences,
    saveProjectsToStorage,
    createProject,
    selectProject,
    addToHistory,
    updateHistory,
    loadFromHistory,
    resetForm,
    toggleVariantForComparison,
    createWorkflow,
    saveWorkflow,
    runWorkflow,
    completeWorkflow,
    
    variables,
    variableDefinitions,
    addVariable,
    applyVariables,
  };
});

