// Enhanced API utilities with better error handling and performance

interface ModelParams {
  model: string
  temperature: number
  maxOutputTokens: number
}

interface AnalysisResult {
  inferredPrompt: string
  confidence: number
  reasoning: string
  suggestedImprovements: string[]
}

interface ApiError extends Error {
  code?: string
  status?: number
}

// Rate limiting and retry logic
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly timeWindow: number

  constructor(maxRequests = 10, timeWindowMs = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowMs
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.timeWindow - (now - oldestRequest) + 100
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return this.waitIfNeeded()
    }

    this.requests.push(now)
  }
}

const rateLimiter = new RateLimiter()

// Enhanced retry logic with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimiter.waitIfNeeded()
      return await operation()
    } catch (error) {
      const apiError = error as ApiError
      
      // Don't retry on client errors (4xx) except rate limiting
      if (apiError.status && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
        throw error
      }

      if (attempt === maxRetries) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      console.warn(`API request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms...`, error)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Maximum retries exceeded')
}

// Improved Gemini API client
async function executeGeminiPrompt(
  apiKey: string, 
  prompt: string, 
  params: ModelParams
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error: ApiError = new Error(
      errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
    )
    error.status = response.status
    error.code = errorData.error?.code
    throw error
  }

  const data = await response.json()
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response generated. The content may have been blocked by safety filters.')
  }

  const candidate = data.candidates[0]
  
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Response blocked due to safety concerns. Please try rephrasing your input.')
  }
  
  if (!candidate.content?.parts?.[0]?.text) {
    throw new Error('Invalid response format from API')
  }

  return candidate.content.parts[0].text.trim()
}

// Safely parse JSON responses with fallback
function parseGeminiResponse(response: string): Partial<AnalysisResult> {
  // First, try to find JSON within the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : response;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON response, attempting to extract data manually:', error);
    
    // Fallback: try to extract data manually using regex
    const extractValue = (key: string, defaultValue: any = '') => {
      const patterns = [
        new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i'),
        new RegExp(`"${key}"\\s*:\\s*(\\d+)`, 'i'),
        new RegExp(`${key}[^:]*:\\s*"([^"]*)"`, 'i'),
        new RegExp(`${key}[^:]*:\\s*(\\d+)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match) {
          const value = match[1];
          return key === 'confidence' ? parseInt(value) || 0 : value;
        }
      }
      return defaultValue;
    };

    const extractArray = (key: string): string[] => {
      const arrayPattern = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`, 'i');
      const match = response.match(arrayPattern);
      if (match) {
        return match[1]
          .split(',')
          .map(item => item.replace(/["\s]/g, ''))
          .filter(item => item.length > 0);
      }
      return [];
    };

    return {
      inferredPrompt: extractValue('inferredPrompt'),
      confidence: extractValue('confidence', 0),
      reasoning: extractValue('reasoning'),
      suggestedImprovements: extractArray('suggestedImprovements')
    };
  }
}

// Input validation and sanitization
function validateAndSanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  
  if (trimmed.length < 10) {
    throw new Error('Input must be at least 10 characters long');
  }

  if (trimmed.length > 50000) {
    throw new Error('Input too long. Maximum 50,000 characters allowed.');
  }

  // Basic content filtering
  const suspiciousPatterns = [
    /(?:hack|exploit|bypass|jailbreak|prompt injection)/i,
    /(?:ignore.{0,20}instructions|forget.{0,20}instructions)/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error('Input contains potentially harmful content and cannot be processed');
    }
  }

  return trimmed;
}

// Enhanced prompt inference with multiple strategies
export const inferPromptFromOutput = async (output: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please check your environment variables.');
  }

  const sanitizedOutput = validateAndSanitizeInput(output);

  const reverseEngineeringPrompt = `You are an expert in reverse prompt engineering with deep knowledge of AI model behaviors, prompt patterns, and output analysis.

Your task is to analyze the given AI-generated output and infer the most likely prompt that could have produced it.

ANALYSIS FRAMEWORK:
1. Content Structure: Identify formatting, organization, and presentation patterns
2. Tone & Style: Detect formality level, voice, and writing characteristics
3. Domain Expertise: Recognize specialized knowledge areas or contexts
4. Task Type: Determine if it's creative, analytical, instructional, etc.
5. Constraints: Look for evidence of specific limitations or requirements

OUTPUT TO ANALYZE:
"""
${sanitizedOutput}
"""

Based on your analysis, provide a concise, actionable prompt that would likely generate similar content. Consider:
- The specific task or request type
- Required tone, style, and format
- Any apparent constraints or specifications
- The level of detail and expertise demonstrated
- Context clues about the intended audience

Return ONLY the inferred prompt text, without explanations, quotation marks, or additional formatting.`;

  return withRetry(async () => {
    const modelParams: ModelParams = {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.2,
      maxOutputTokens: 2000
    };

    const response = await executeGeminiPrompt(apiKey, reverseEngineeringPrompt, modelParams);
    
    // Clean up the response
    let cleanedPrompt = response.trim();
    
    // Remove common prefixes and suffixes
    const prefixesToRemove = [
      'Here is the inferred prompt:',
      'The inferred prompt is:',
      'Inferred prompt:',
      'Prompt:',
      'Based on the analysis, the prompt would be:',
      'The likely prompt is:',
      'Here\'s the prompt:',
      'The prompt that likely generated this output:'
    ];
    
    const suffixesToRemove = [
      'This prompt should generate similar content.',
      'This would likely produce the given output.',
      'Hope this helps!'
    ];
    
    // Remove prefixes
    for (const prefix of prefixesToRemove) {
      if (cleanedPrompt.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleanedPrompt = cleanedPrompt.substring(prefix.length).trim();
        break;
      }
    }
    
    // Remove suffixes
    for (const suffix of suffixesToRemove) {
      if (cleanedPrompt.toLowerCase().endsWith(suffix.toLowerCase())) {
        cleanedPrompt = cleanedPrompt.substring(0, cleanedPrompt.length - suffix.length).trim();
        break;
      }
    }
    
    // Remove wrapping quotes
    if ((cleanedPrompt.startsWith('"') && cleanedPrompt.endsWith('"')) ||
        (cleanedPrompt.startsWith("'") && cleanedPrompt.endsWith("'"))) {
      cleanedPrompt = cleanedPrompt.slice(1, -1).trim();
    }
    
    if (!cleanedPrompt) {
      throw new Error('Failed to extract a meaningful prompt from the response');
    }
    
    return cleanedPrompt;
  });
};

// Enhanced prompt execution with better error handling
export const enhancePrompt = async (prompt: string, context: string = ''): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please check your environment variables.');
  }

  const sanitizedPrompt = validateAndSanitizeInput(prompt);
  
  return withRetry(async () => {
    const modelParams: ModelParams = {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxOutputTokens: 8000
    };

    const enhancedPrompt = context ? `${context.trim()}\n\n${sanitizedPrompt}` : sanitizedPrompt;
    const response = await executeGeminiPrompt(apiKey, enhancedPrompt, modelParams);
    
    if (!response || response.length < 10) {
      throw new Error('Generated response is too short or empty');
    }
    
    return response;
  });
};

// Advanced analysis with structured output
export const analyzeOutputStructure = async (output: string): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please check your environment variables.');
  }

  const sanitizedOutput = validateAndSanitizeInput(output);

  const analysisPrompt = `You are an expert AI researcher specializing in reverse prompt engineering and output analysis. Your task is to perform a comprehensive analysis of the given AI-generated output.

ANALYSIS CRITERIA:
1. **Content Analysis**: Structure, organization, complexity level
2. **Style Analysis**: Tone, formality, voice, writing patterns
3. **Task Recognition**: Type of request (creative, analytical, instructional, etc.)
4. **Constraint Detection**: Specific formatting, length, or content requirements
5. **Context Clues**: Domain expertise, target audience, use case
6. **Pattern Recognition**: Common prompt structures that produce similar outputs

OUTPUT TO ANALYZE:
"""
${sanitizedOutput}
"""

Provide your analysis as a valid JSON object with this exact structure:
{
  "inferredPrompt": "Your best reconstruction of the original prompt",
  "confidence": 85,
  "reasoning": "Detailed explanation of your analysis and why you believe this prompt would generate the output",
  "suggestedImprovements": [
    "Specific suggestion 1 for improving the inferred prompt",
    "Specific suggestion 2 for making it more effective",
    "Specific suggestion 3 for better precision"
  ]
}

REQUIREMENTS:
- inferredPrompt: Clear, actionable prompt (50-500 words)
- confidence: Integer from 0-100 based on your certainty
- reasoning: 2-3 sentences explaining your analysis
- suggestedImprovements: 2-5 specific, actionable suggestions

Respond with ONLY the JSON object, no additional text or formatting.`;

  return withRetry(async () => {
    const modelParams: ModelParams = {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.1,
      maxOutputTokens: 4000
    };

    const response = await executeGeminiPrompt(apiKey, analysisPrompt, modelParams);
    const parsed = parseGeminiResponse(response);
    
    // Validate and provide defaults
    const result: AnalysisResult = {
      inferredPrompt: parsed.inferredPrompt || '',
      confidence: Math.max(0, Math.min(100, parsed.confidence || 0)),
      reasoning: parsed.reasoning || 'Analysis completed but reasoning not available.',
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) 
        ? parsed.suggestedImprovements.filter(item => typeof item === 'string' && item.length > 0)
        : []
    };
    
    if (!result.inferredPrompt) {
      throw new Error('Failed to generate an inferred prompt from the analysis');
    }
    
    return result;
  });
};

// Utility function to check API health
export const checkApiHealth = async (): Promise<boolean> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    await executeGeminiPrompt(apiKey, 'Test prompt for health check. Respond with "OK".', {
      model: 'gemini-2.0-flash-exp',
      temperature: 0,
      maxOutputTokens: 10
    });
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Export rate limiter for external use if needed
export { rateLimiter };