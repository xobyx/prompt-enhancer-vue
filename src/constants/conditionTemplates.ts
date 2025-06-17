// Condition templates for workflow builder
export const conditionTemplates = [
  {
    id: 'contains_keyword',
    name: 'Contains Keyword',
    expression: 'output.toLowerCase().includes("keyword")',
    description: 'Output contains specific keyword'
  },
  {
    id: 'sentiment_positive',
    name: 'Positive Sentiment',
    expression: 'sentimentAnalysis(output) === "positive"',
    description: 'Output has positive sentiment'
  },
  {
    id: 'length_check',
    name: 'Length Check',
    expression: 'output.length > 100',
    description: 'Output is longer than 100 characters'
  },
  {
    id: 'json_valid',
    name: 'Valid JSON',
    expression: 'JSON.parse(output) !== null',
    description: 'Output is valid JSON'
  }
];

