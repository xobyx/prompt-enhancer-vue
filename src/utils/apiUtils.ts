import { GoogleGenerativeAI } from '@google/generative-ai';

export const parseGeminiResponse = (jsonStr: string) => {
  let cleanedJson = jsonStr.trim();
  
  // Remove potential markdown code blocks
  const codeBlockPatterns = [
    /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s,
    /^`(.*?)`$/s,
  ];
  
  for (const pattern of codeBlockPatterns) {
    const match = cleanedJson.match(pattern);
    if (match && match[1]) {
      cleanedJson = match[1].trim();
      break;
    }
  }
  
  // Remove comments
  cleanedJson = cleanedJson.replace(/^\s*\/\*.*?\*\/\s*/s, '');
  cleanedJson = cleanedJson.replace(/^\s*\/\/.*$/gm, '');
  
  try {
    const parsed = JSON.parse(cleanedJson);
    
    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error("Response is not a valid object");
    }
    
    // Check for any of the expected result structures
    const hasValidStructure = 
      parsed.generatedPrompts || 
      parsed.enhanced_variants || 
      parsed.engineered_variants ||
      parsed.analysis ||
      parsed.initial_assessment ||
      parsed.architectural_analysis;
    
    if (!hasValidStructure) {
      throw new Error("Missing expected prompt variants or analysis in response");
    }
    
    const variantsKey = Object.keys(parsed).find(k => k.endsWith('_variants') || k.endsWith('Prompts'));
    if(variantsKey && Array.isArray(parsed[variantsKey])){
      parsed[variantsKey] = parsed[variantsKey].map((v: any, i: number) => ({...v, id: `${Date.now()}-${i}`}));
    }
    return parsed;
  } catch (error) {
    // If parsing fails, try to extract JSON from malformed response
    const jsonMatch = cleanedJson.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Fallback JSON parsing failed:", e);
      }
    }
    
    return {
      raw_response: jsonStr,
      error: error instanceof Error ? error.message : "Unknown JSON parsing error",
      truncated_response: jsonStr.length > 500 ? jsonStr.substring(0, 500) + "..." : jsonStr
    };
  }
};

export const executeGeminiPrompt = async (
  apiKey: string,
  prompt: string,
  modelParams: any
) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelParams.model,
      generationConfig: {
        temperature: modelParams.temperature,
        maxOutputTokens: modelParams.maxOutputTokens
      }
    });
    
    const generationResult = await model.generateContent(prompt);
    return await generationResult.response.text();
  } catch (error: any) {
    throw new Error(`API Error: ${error.message}`);
  }
};


// Reverse Engineering API Functions
export const inferPromptFromOutput = async (output: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const reverseEngineeringPrompt = `You are an expert in reverse prompt engineering. Your task is to analyze the given AI-generated output and infer the most likely prompt that could have produced it.

Please analyze the following AI-generated text and provide a concise, effective prompt that would likely generate similar content:

OUTPUT TO ANALYZE:
"""
${output}
"""

Based on this output, please provide:
1. A clear, actionable prompt that could generate similar content
2. Focus on identifying the key instructions, tone, style, and format requirements
3. Make the prompt specific enough to be useful but general enough to be reusable

Return only the inferred prompt without additional explanation or formatting.`;

  try {
    const modelParams = {
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxOutputTokens: 5000
    };

    const response = await executeGeminiPrompt(apiKey, reverseEngineeringPrompt, modelParams);
    
    // Clean up the response to extract just the prompt
    let cleanedPrompt = response.trim();
    
    // Remove common prefixes that might be added by the model
    const prefixesToRemove = [
      'Here is the inferred prompt:',
      'The inferred prompt is:',
      'Inferred prompt:',
      'Prompt:',
      'Based on the analysis, the prompt would be:',
      'The likely prompt is:'
    ];
    
    for (const prefix of prefixesToRemove) {
      if (cleanedPrompt.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleanedPrompt = cleanedPrompt.substring(prefix.length).trim();
        break;
      }
    }
    
    // Remove quotes if the entire response is wrapped in them
    if ((cleanedPrompt.startsWith('"') && cleanedPrompt.endsWith('"')) ||
        (cleanedPrompt.startsWith("'") && cleanedPrompt.endsWith("'"))) {
      cleanedPrompt = cleanedPrompt.slice(1, -1);
    }
    
    return cleanedPrompt;
  } catch (error: any) {
    throw new Error(`Failed to infer prompt: ${error.message}`);
  }
};

export const enhancePrompt = async (prompt: string, context: string = ''): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  try {
    const modelParams = {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 10000
    };

    const enhancedPrompt = context ? `${context}\n\n${prompt}` : prompt;
    const response = await executeGeminiPrompt(apiKey, enhancedPrompt, modelParams);
    
    return response;
  } catch (error: any) {
    throw new Error(`Failed to execute prompt: ${error.message}`);
  }
};

// Advanced reverse engineering with detailed analysis
export const analyzeOutputStructure = async (output: string): Promise<{
  inferredPrompt: string;
  confidence: number;
  reasoning: string;
  suggestedImprovements: string[];
}> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const analysisPrompt = `You are an expert in reverse prompt engineering and AI output analysis. Analyze the given output and provide a comprehensive reverse engineering assessment.

OUTPUT TO ANALYZE:
"""
${output}
"""

Please provide a JSON response with the following structure:
{
  "inferredPrompt": "The most likely prompt that generated this output",
  "confidence": 85,
  "reasoning": "Detailed explanation of why this prompt was inferred",
  "suggestedImprovements": ["List of suggestions to improve the inferred prompt"]
}

Focus on:
- Identifying the writing style, tone, and format
- Detecting any specific instructions or constraints
- Recognizing patterns that suggest particular prompt structures
- Assessing the complexity and specificity of the original prompt

Provide confidence as a percentage (0-100) based on how certain you are about the inference.`;

  try {
    const modelParams = {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      maxOutputTokens: 8000
    };

    const response = await executeGeminiPrompt(apiKey, analysisPrompt, modelParams);
    const parsed = parseGeminiResponse(response);
    
    return {
      inferredPrompt: parsed.inferredPrompt || '',
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || '',
      suggestedImprovements: parsed.suggestedImprovements || []
    };
  } catch (error: any) {
    throw new Error(`Failed to analyze output structure: ${error.message}`);
  }
};
