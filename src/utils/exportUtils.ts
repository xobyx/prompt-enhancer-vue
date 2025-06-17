export const exportToJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToMarkdown = (data: any, filename: string) => {
  let markdown = `# Prompt Engineering Results\n\n`;
  if (data.analysis || data.initial_assessment || data.architectural_analysis) {
    markdown += `## Analysis\n\n${data.analysis || data.initial_assessment || data.architectural_analysis}\n\n`;
  }
  if (data.insights || data.engineering_insights || data.design_principles) {
    markdown += `## Engineering Insights\n\n${data.insights || data.engineering_insights || data.design_principles}\n\n`;
  }
  const variants = data.generatedPrompts || data.enhanced_variants || data.engineered_variants || [];
  if (variants.length > 0) {
    markdown += `## Enhanced Prompt Variants\n\n`;
    variants.forEach((variant: any, i: number) => {
      markdown += `### Variant ${i + 1}: ${variant.category || variant.architecture_type || 'Enhanced Prompt'}\n\n`;
      markdown += `#### Prompt\n\`\`\`\n${variant.prompt}\n\`\`\`\n\n`;
      if (variant.reasoning) markdown += `#### Reasoning\n${variant.reasoning}\n\n`;
      if (variant.strengths) markdown += `#### Strengths\n${variant.strengths.map((s: string) => `- ${s}`).join('\n')}\n\n`;
      if (variant.ideal_use_cases) markdown += `#### Ideal Use Cases\n${variant.ideal_use_cases.map((u: string) => `- ${u}`).join('\n')}\n\n`;
    });
  }
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const formatDate = (date: Date) => 
  new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date);

