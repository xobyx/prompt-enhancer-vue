// src/utils/workflowUtils.ts
import type { Condition, WorkflowStep } from '../types/appTypes';

export const safeEval = (expression: string, context: Record<string, any>): boolean => {
  try {
    const safeContext = {
      ...context,
      JSON: JSON,
      Math: Math,
      includes: (str: string, search: string) => str.includes(search),
      length: (str: string) => str.length,
      sentimentAnalysis: (text: string) => {
        const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy'];
        const negativeWords = ['bad', 'poor', 'negative', 'unhappy', 'terrible'];
        
        const positiveCount = positiveWords.filter(w => text.toLowerCase().includes(w)).length;
        const negativeCount = negativeWords.filter(w => text.toLowerCase().includes(w)).length;
        
        return positiveCount > negativeCount ? 'positive' : 
               negativeCount > positiveCount ? 'negative' : 'neutral';
      }
    };
    
    // Create function with context variables as parameters
    const func = new Function(...Object.keys(safeContext), 
      `return (${expression});`
    );
    
    // Execute function with context values
    return !!func(...Object.values(safeContext));
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
};

export const safeProcess = (
  expression: string, 
  context: Record<string, any>
): any => {
  try {
    const safeContext = {
      ...context,
      JSON: JSON,
      Math: Math,
      includes: (str: string, search: string) => str.includes(search),
      length: (str: string) => str.length,
      sentimentAnalysis: context.sentimentAnalysis || ((text: string) => 'neutral')
    };
    
    // Create function with context variables as parameters
    const func = new Function(...Object.keys(safeContext), 
      `return (${expression});`
    );
    
    // Execute function with context values
    return func(...Object.values(safeContext));
  } catch (error) {
    console.error('Output processing error:', error);
    throw new Error(`Output processing failed: ${error}`);
  }
};

export const generateWorkflowDiagram = (steps: WorkflowStep[], conditions: Condition[]) => {
  let diagram = "Workflow Diagram:\n";
  steps.forEach(step => {
    diagram += `[${step.name}] (${step.id})\n`;
    const outgoing = conditions.filter(c => c.sourceStepId === step.id);
    outgoing.forEach(cond => {
      const trueTarget = steps.find(s => s.id === cond.trueTargetStepId);
      const falseTarget = cond.falseTargetStepId ? steps.find(s => s.id === cond.falseTargetStepId) : null;
      
      if (trueTarget) {
        diagram += `  -> (${cond.description} ✓) -> [${trueTarget.name}]\n`;
      }
      
      if (falseTarget) {
        diagram += `  -> (${cond.description} ✗) -> [${falseTarget.name}]\n`;
      } else if (cond.falseTargetStepId === null) {
        diagram += `  -> (${cond.description} ✗) -> [STOP]\n`;
      }
    });
  });
  return diagram;
};