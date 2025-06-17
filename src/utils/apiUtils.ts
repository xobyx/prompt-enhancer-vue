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

