export interface _Condition {
  id: string;
  sourceStepId: string;
  trueTargetStepId: string;  // Step to execute when condition is true
  falseTargetStepId: string; // Step to execute when condition is false
  expression: string;
  description: string;
}
export type GenerationConfig {
            temperature: string;
            topP: string;
            topK: string;
            reason: string;
      }
export type PromptVariant = {
  id: string;
  prompt: string;

  category?: string;
  architecture_type?: string;
  optimization_target?: string;
  
  reasoning?: string; // all
  strengths?: string[];//all

  ideal_use_cases?: string[];
  best_applications?: string[];


  
  technical_notes?: string;
  
  complexity_level?: string;
  
  appropriate_generation_config:GenerationConfig;
};

export type PromptHistoryItem = {
  id: string;
  timestamp: Date;
  inputPrompt: string;
  version: string;
  result: any;
  questionAnswers?: Record<string, string>;
  reEnhanced?: boolean; // Add this line
  reEnhancedAt?: Date; // Add this line
};

export type Project = {
  id: string;
  name: string;
  createdAt: Date;
  history: PromptHistoryItem[];
  workflows: Workflow[];
};

export type ModelParameters = {
  model: string;
  temperature: number;
  maxOutputTokens: number;
};

export type ComparisonResult = {
  variantId: string;
  output: string;
  error?: string;
  loading: boolean;
};

export type _WorkflowStep = {
  id: string;
  name: string;
  prompt: string;
  position: { x: number; y: number };
  conditions?: Condition[];
};



export type Workflow = {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: Date;
  executions: WorkflowExecution[];
};

export type _WorkflowExecution = {
  id: string;
  createdAt: Date;
  steps: {
    stepId: string;
    input: string;
    output: string;
    executedAt: Date;
    success: boolean;
  }[];
};

export type PromptVersionConfig = {
  name: string;
  icon: any; // Changed from JSX.Element to any for Vue compatibility
  description: string;
  prompt: string;
};

export type ConditionTemplate = {
  id: string;
  name: string;
  expression: string;
  description: string;
};



/////



export interface WorkflowStep {
  id: string;
  name: string;
  prompt: string;
  outputProcessor?: string;
  position: { x: number; y: number };
  conditions?: Condition[];
}

export interface Condition {
  id: string;
  sourceStepId: string;
  trueTargetStepId: string;
  falseTargetStepId: string | null; // Now nullable
  expression: string;
  description: string;
}

export interface WorkflowExecution {
  id: string;
  createdAt: Date;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  stepId: string;
  input: string;
  output: string;
  executedAt: Date;
  success: boolean;
}

export type PromptVersion = {
  timestamp: Date;
  content: string;
};

export type VersionedPrompt = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  versions: PromptVersion[];
};
