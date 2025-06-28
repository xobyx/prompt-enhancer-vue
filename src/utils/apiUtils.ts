import { GoogleGenerativeAI } from '@google/generative-ai';

// Enhanced interfaces
interface ModelParams {
  model: string;
  temperature: number;
  maxOutputTokens: number;
}

interface AnalysisResult {
  inferredPrompt: string;
  confidence: number;
  reasoning: string;
  suggestedImprovements: string[];
}

interface ApiError extends Error {
  code?: string;
  status?: number;
  retryAfter?: number;
}

// Advanced rate limiting with token bucket algorithm
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;
  private readonly refillInterval: number;

  constructor(capacity = 10, refillRate = 1, refillIntervalMs = 6000) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillIntervalMs;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval) * this.refillRate;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  async waitIfNeeded(): Promise<void> {
    this.refillTokens();
    
    if (this.tokens <= 0) {
      const waitTime = this.refillInterval - (Date.now() - this.lastRefill) + 100;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitIfNeeded();
    }
    
    this.tokens--;
  }

  getStatus(): { tokens: number; capacity: number } {
    this.refillTokens();
    return { tokens: this.tokens, capacity: this.capacity };
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(15, 2, 4000); // 15 requests capacity, refill 2 every 4 seconds

// Enhanced retry logic with jitter and circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 30000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - too many recent failures');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

const circuitBreaker = new CircuitBreaker();

// Enhanced retry function with exponential backoff and jitter
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  return circuitBreaker.execute(async () => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await rateLimiter.waitIfNeeded();
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const apiError = error as ApiError;
        
        // Don't retry on client errors (4xx) except rate limiting and quota exceeded
        if (apiError.status && apiError.status >= 400 && apiError.status < 500 && 
            ![429, 403].includes(apiError.status)) {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000;
        const delay = Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
        
        console.warn(`API request failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms...`, {
          error: apiError.message,
          status: apiError.status,
          code: apiError.code
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  });
}

// Enhanced Gemini API client with improved error handling
export async function executeGeminiPrompt(
  apiKey: string,
  prompt: string,
  params: ModelParams
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(params)
  const generationConfig = {
    temperature: params.temperature,
    maxOutputTokens: params.maxOutputTokens,
    topP: 0.95,
    topK: 40,
  };

  const model = genAI.getGenerativeModel({
    model: params.model,
    generationConfig,
    /*
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
    */
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
    }

    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response received from API');
    }

    return text.trim();
  } catch (error: any) {
    // Enhanced error handling with specific error types
    const apiError: ApiError = new Error(error.message || 'Unknown API error');
    
    if (error.message?.includes('quota')) {
      apiError.code = 'QUOTA_EXCEEDED';
      apiError.status = 429;
    } else if (error.message?.includes('blocked')) {
      apiError.code = 'CONTENT_BLOCKED';
      apiError.status = 400;
    } else if (error.message?.includes('rate limit')) {
      apiError.code = 'RATE_LIMITED';
      apiError.status = 429;
    }
    
    throw apiError;
  }
}

// Optimized JSON parsing with multiple fallback strategies
export const parseGeminiResponse = (jsonStr: string): any => {
  if (!jsonStr || typeof jsonStr !== 'string') {
    throw new Error('Invalid input: expected non-empty string');
  }

  let cleanedJson = jsonStr.trim();
  
  // Remove markdown code blocks
  const codeBlockPatterns = [
    /^```(?:json|javascript)?\s*\n?(.*?)\n?\s*```$/s,
    /^`{3,}(?:json|javascript)?\s*\n?(.*?)\n?\s*`{3,}$/s,
    /^`(.*?)`$/s,
  ];
  
  for (const pattern of codeBlockPatterns) {
    const match = cleanedJson.match(pattern);
    if (match?.[1]) {
      cleanedJson = match[1].trim();
      break;
    }
  }
  
  // Remove comments and clean up
  cleanedJson = cleanedJson
    .replace(/^\s*\/\*.*?\*\/\s*/s, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  const parseStrategies = [
    // Strategy 1: Direct parsing
    () => JSON.parse(cleanedJson),
    
    // Strategy 2: Extract first complete JSON object
    () => {
      const match = cleanedJson.match(/\{(?:[^{}]|{[^{}]*})*\}/);
      return match ? JSON.parse(match[0]) : null;
    },
    
    // Strategy 3: Find JSON between specific markers
    () => {
      const patterns = [
        /(?:response|result|output):\s*(\{.*?\})/s,
        /(\{[^}]+(?:"[^"]*"[^}]*)*\})/s
      ];
      
      for (const pattern of patterns) {
        const match = cleanedJson.match(pattern);
        if (match?.[1]) {
          return JSON.parse(match[1]);
        }
      }
      return null;
    }
  ];

  for (const strategy of parseStrategies) {
    try {
      const result = strategy();
      if (result && typeof result === 'object') {
        // Validate and enhance the parsed object
        return validateAndEnhanceResult(result);
      }
    } catch (error) {
      continue;
    }
  }

  // Final fallback: return structured error response
  return {
    error: 'Failed to parse JSON response',
    raw_response: jsonStr.length > 1000 ? jsonStr.substring(0, 1000) + '...' : jsonStr,
    parsing_attempts: parseStrategies.length
  };
};

// Validate and enhance parsed results
function validateAndEnhanceResult(parsed: any): any {
  if (!parsed || typeof parsed !== 'object') {
    return parsed;
  }

  // Add IDs to arrays if they don't exist
  const arrayKeys = Object.keys(parsed).filter(key => 
    Array.isArray(parsed[key]) && key.includes('variant')
  );

  arrayKeys.forEach(key => {
    parsed[key] = parsed[key].map((item: any, index: number) => ({
      ...item,
      id: item.id || `${Date.now()}-${index}`
    }));
  });

  return parsed;
}

// Enhanced input validation with security checks
function validateAndSanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  
  if (trimmed.length < 5) {
    throw new Error('Input must be at least 5 characters long');
  }

  if (trimmed.length > 100000) {
    throw new Error('Input too long. Maximum 100,000 characters allowed.');
  }

  // Enhanced security filtering
  const suspiciousPatterns = [
    /(?:hack|exploit|bypass|jailbreak|prompt.?injection)/i,
    /(?:ignore.{0,30}(?:instructions|rules|guidelines))/i,
    /(?:forget.{0,30}(?:instructions|rules|guidelines))/i,
    /(?:pretend|act.as|roleplay).{0,20}(?:admin|root|system)/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:|data:|vbscript:/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error('Input contains potentially harmful content and cannot be processed');
    }
  }

  return trimmed;
}

// Optimized model parameter selection
function getOptimalModelParams(taskType: 'inference' | 'enhancement' | 'analysis'): ModelParams {
  const configs = {
    inference: {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.1,
      maxOutputTokens: 2000
    },
    enhancement: {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.7,
      maxOutputTokens: 8000
    },
    analysis: {
      model: 'gemini-2.0-flash-exp',
      temperature: 0.2,
      maxOutputTokens: 4000
    }
  };

  return configs[taskType];
}

// Enhanced prompt inference with caching
const promptCache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

export const inferPromptFromOutput = async (output: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please check your environment variables.');
  }

  const sanitizedOutput = validateAndSanitizeInput(output);
  const cacheKey = `infer_${sanitizedOutput.substring(0, 100)}`;
  
  // Check cache
  const cached = promptCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const reverseEngineeringPrompt = `You are an expert reverse prompt engineer. Analyze this AI output and infer the original prompt.

ANALYSIS FRAMEWORK:
1. Content type and structure
2. Writing style and tone
3. Formatting requirements
4. Domain expertise level
5. Task complexity

OUTPUT TO ANALYZE:
"""
${sanitizedOutput}
"""

Provide a concise, actionable prompt that would generate similar content. Focus on:
- Specific task requirements
- Tone and style specifications  
- Format constraints
- Context or domain
- Expected output structure

Return ONLY the inferred prompt text.`;

  const result = await withRetry(async () => {
    const modelParams = getOptimalModelParams('inference');
    const response = await executeGeminiPrompt(apiKey, reverseEngineeringPrompt, modelParams);
    
    return cleanPromptResponse(response);
  });

  // Cache the result
  promptCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
};

// Optimized prompt cleaning
function cleanPromptResponse(response: string): string {
  let cleaned = response.trim();
  
  // Remove common prefixes (case-insensitive)
  const prefixes = [
    'here is the inferred prompt:',
    'the inferred prompt is:',
    'inferred prompt:',
    'prompt:',
    'based on the analysis, the prompt would be:',
    'the likely prompt is:'
  ];
  
  const lowerCleaned = cleaned.toLowerCase();
  for (const prefix of prefixes) {
    if (lowerCleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  
  // Remove wrapping quotes
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  
  if (!cleaned) {
    throw new Error('Failed to extract meaningful prompt from response');
  }
  
  return cleaned;
}

// Enhanced prompt execution
export const enhancePrompt = async (prompt: string, context: string = ''): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const sanitizedPrompt = validateAndSanitizeInput(prompt);
  
  return withRetry(async () => {
    const modelParams = getOptimalModelParams('enhancement');
    const enhancedPrompt = context ? `${context.trim()}\n\n${sanitizedPrompt}` : sanitizedPrompt;
    
    const response = await executeGeminiPrompt(apiKey, enhancedPrompt, modelParams);
    
    if (response.length < 10) {
      throw new Error('Generated response is too short');
    }
    
    return response;
  });
};

// Advanced structural analysis with caching
export const analyzeOutputStructure = async (output: string): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const sanitizedOutput = validateAndSanitizeInput(output);
  
  const analysisPrompt = `You are an expert AI analyst specializing in reverse prompt engineering. Perform comprehensive output analysis.

OUTPUT TO ANALYZE:
"""
${sanitizedOutput}
"""

Analyze for:
- Content structure and patterns
- Writing style indicators
- Task type recognition
- Constraint detection
- Context clues

Respond with valid JSON:
{
  "inferredPrompt": "Reconstructed original prompt",
  "confidence": 85,
  "reasoning": "Analysis explanation in 2-3 sentences",
  "suggestedImprovements": [
    "Specific improvement 1",
    "Specific improvement 2"
  ]
}

Requirements:
- inferredPrompt: 50-500 words, clear and actionable
- confidence: 0-100 integer
- reasoning: Concise explanation
- suggestedImprovements: 2-4 actionable suggestions

JSON only, no additional text.`;

  return withRetry(async () => {
    const modelParams = getOptimalModelParams('analysis');
    const response = await executeGeminiPrompt(apiKey, analysisPrompt, modelParams);
    const parsed = parseGeminiResponse(response);
    
    // Validate and provide defaults
    const result: AnalysisResult = {
      inferredPrompt: parsed.inferredPrompt || '',
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
      reasoning: parsed.reasoning || 'Analysis completed successfully.',
      suggestedImprovements: Array.isArray(parsed.suggestedImprovements) 
        ? parsed.suggestedImprovements.filter((item: any) => 
            typeof item === 'string' && item.length > 0
          )
        : []
    };
    
    if (!result.inferredPrompt) {
      throw new Error('Failed to generate inferred prompt from analysis');
    }
    
    return result;
  });
};

// Health check with detailed diagnostics
export const checkApiHealth = async (): Promise<{
  healthy: boolean;
  latency?: number;
  rateLimitStatus: { tokens: number; capacity: number };
  circuitBreakerState: string;
}> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      healthy: false,
      rateLimitStatus: rateLimiter.getStatus(),
      circuitBreakerState: circuitBreaker.getState()
    };
  }

  const startTime = Date.now();
  
  try {
    await executeGeminiPrompt(apiKey, 'Health check. Respond with "OK".', {
      model: 'gemini-2.0-flash-exp',
      temperature: 0,
      maxOutputTokens: 5
    });
    
    return {
      healthy: true,
      latency: Date.now() - startTime,
      rateLimitStatus: rateLimiter.getStatus(),
      circuitBreakerState: circuitBreaker.getState()
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      healthy: false,
      rateLimitStatus: rateLimiter.getStatus(),
      circuitBreakerState: circuitBreaker.getState()
    };
  }
};

// Utility to clear caches
export const clearCaches = (): void => {
  promptCache.clear();
};

// Export utilities for external use
export { rateLimiter, circuitBreaker };