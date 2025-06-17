import type { Condition, WorkflowStep } from '../types/appTypes';

export const safeEval = (expression: string, context: Record<string, any>): boolean => {
  try {
    const safeContext = {
      ...context,
      JSON: JSON,
      Math: Math,
      includes: String.prototype.includes,
      length: String.prototype.length,
      sentimentAnalysis: (text: string) => {
        const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy'];
        const negativeWords = ['bad', 'poor', 'negative', 'unhappy', 'terrible'];
        
        const positiveCount = positiveWords.filter(w => text.includes(w)).length;
        const negativeCount = negativeWords.filter(w => text.includes(w)).length;
        
        return positiveCount > negativeCount ? 'positive' : 
               negativeCount > positiveCount ? 'negative' : 'neutral';
      }
    };
    
    const func = new Function(...Object.keys(safeContext), 
      `return (${expression})`)(...Object.values(safeContext));
    
    return !!func();
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
};

export const generateWorkflowDiagram = (steps: WorkflowStep[], conditions: Condition[]) => {
  let diagram = "Workflow Diagram:\n";
  steps.forEach(step => {
    diagram += `[${step.name}] (${step.id})\n`;
    const outgoing = conditions.filter(c => c.sourceStepId === step.id);
    outgoing.forEach(cond => {
      diagram += `  -> (${cond.description}) -> [${steps.find(s => s.id === cond.targetStepId)?.name}]\n`;
    });
  });
  return diagram;
};

