/**
 * Search Intent Detector
 *
 * Analyzes user questions to determine intent type:
 * - Attribute queries: "How many colors?", "What metals?", "What purity options?"
 * - Product queries: "Tell me about Aria", "What's a Tanmaniya?"
 * - Collection queries: "Show me rings", "What's in the gold collection?"
 * - General queries: Other questions about Trayi, policies, etc.
 */

export type SearchIntentType = 'attribute' | 'product' | 'collection' | 'general';

export interface SearchIntent {
  type: SearchIntentType;
  key?: string; // For attribute queries (e.g., 'color', 'purity', 'size', 'carat')
  query?: string; // For product/general queries
  confidence: number; // 0-1 confidence score
}

/**
 * Attribute keywords for different types
 */
const ATTRIBUTE_KEYWORDS = {
  color: [
    'color',
    'colour',
    'metal',
    'metals',
    'gold',
    'rose',
    'yellow',
    'white',
    'variations',
  ],
  purity: [
    'purity',
    'karat',
    'kt',
    'karats',
    'pure',
    'purities',
  ],
  size: [
    'size',
    'sizes',
    'ring size',
    'length',
    'dimensions',
    'fit',
  ],
  carat: [
    'carat',
    'carats',
    'ct',
    'diamond weight',
    'diamond carat',
  ],
};

/**
 * Collection keywords and patterns
 */
const COLLECTION_KEYWORDS = [
  'rings',
  'earrings',
  'pendants',
  'necklaces',
  'bracelets',
  'tanmaniya',
  'mangalsutra',
  'nose pin',
  'gold',
  'collection',
  'browse',
  'shop',
];

/**
 * Question patterns for attribute queries
 */
const ATTRIBUTE_PATTERNS = [
  /how many.*?(color|colour|metal|purity|karat|size|carat)/i,
  /what.*(color|colour|metal|purity|karat|size|carat).*available/i,
  /what.*(color|colour|metal|purity|karat|size|carat).*option/i,
  /what.*(color|colour|metal|purity|karat|size|carat).*do you/i,
  /(color|colour|metal|purity|karat|size|carat).*options/i,
  /(color|colour|metal|purity|karat|size|carat).*available/i,
];

/**
 * Product name keywords and known products
 */
const PRODUCT_KEYWORDS = [
  'tanmaniya',
  'aria',
  'grace',
  'bloom',
  'celestial',
  'pendant',
  'earring',
  'bracelet',
  'necklace',
  'ring',
];

/**
 * Detect if question is asking about attribute values
 */
function detectAttributeQuery(question: string): SearchIntent | null {
  // Check against attribute patterns
  for (const pattern of ATTRIBUTE_PATTERNS) {
    const match = question.match(pattern);
    if (match) {
      // Determine which attribute
      const lowerQuestion = question.toLowerCase();

      if (ATTRIBUTE_KEYWORDS.color.some(kw => lowerQuestion.includes(kw))) {
        return {
          type: 'attribute',
          key: 'color',
          confidence: 0.95,
        };
      }

      if (ATTRIBUTE_KEYWORDS.purity.some(kw => lowerQuestion.includes(kw))) {
        return {
          type: 'attribute',
          key: 'purity',
          confidence: 0.95,
        };
      }

      if (ATTRIBUTE_KEYWORDS.size.some(kw => lowerQuestion.includes(kw))) {
        return {
          type: 'attribute',
          key: 'size',
          confidence: 0.95,
        };
      }

      if (ATTRIBUTE_KEYWORDS.carat.some(kw => lowerQuestion.includes(kw))) {
        return {
          type: 'attribute',
          key: 'carat',
          confidence: 0.95,
        };
      }
    }
  }

  // Check keyword-based attribute queries
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes('how many') ||
    lowerQuestion.includes('what metal') ||
    lowerQuestion.includes('what color') ||
    lowerQuestion.includes('what colour') ||
    lowerQuestion.includes('what purity') ||
    lowerQuestion.includes('what karat') ||
    lowerQuestion.includes('what size')
  ) {
    for (const [key, keywords] of Object.entries(ATTRIBUTE_KEYWORDS)) {
      if (keywords.some(kw => lowerQuestion.includes(kw))) {
        return {
          type: 'attribute',
          key,
          confidence: 0.85,
        };
      }
    }
  }

  return null;
}

/**
 * Detect if question is asking about a specific product
 */
function detectProductQuery(question: string): SearchIntent | null {
  const lowerQuestion = question.toLowerCase();

  // Check for known product names
  for (const product of PRODUCT_KEYWORDS) {
    if (lowerQuestion.includes(product)) {
      // Phrases like "tell me about", "what is", "describe"
      if (
        lowerQuestion.includes('tell me') ||
        lowerQuestion.includes('what is') ||
        lowerQuestion.includes('what\'s') ||
        lowerQuestion.includes('describe') ||
        lowerQuestion.includes('about')
      ) {
        return {
          type: 'product',
          query: product,
          confidence: 0.9,
        };
      }
    }
  }

  // Generic product questions
  if (
    lowerQuestion.includes('tell me about') ||
    lowerQuestion.includes('what is') ||
    lowerQuestion.includes('describe')
  ) {
    // Extract product name (words after "about", "is", etc.)
    const words = question
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'you', 'with', 'this'].includes(w));

    if (words.length > 0) {
      return {
        type: 'product',
        query: words.join(' '),
        confidence: 0.75,
      };
    }
  }

  return null;
}

/**
 * Detect if question is about a collection
 */
function detectCollectionQuery(question: string): SearchIntent | null {
  const lowerQuestion = question.toLowerCase();

  for (const collection of COLLECTION_KEYWORDS) {
    if (lowerQuestion.includes(collection)) {
      // Phrases like "show me", "browse", "what's in", "collection"
      if (
        lowerQuestion.includes('show me') ||
        lowerQuestion.includes('browse') ||
        lowerQuestion.includes('what\'s in') ||
        lowerQuestion.includes('collection') ||
        lowerQuestion.includes('what do you have')
      ) {
        return {
          type: 'collection',
          query: collection,
          confidence: 0.85,
        };
      }
    }
  }

  return null;
}

/**
 * Main intent detection function
 */
export function analyzeSearchIntent(question: string): SearchIntent {
  // Try each detection in order of specificity
  const attributeIntent = detectAttributeQuery(question);
  if (attributeIntent && attributeIntent.confidence > 0.8) {
    return attributeIntent;
  }

  const productIntent = detectProductQuery(question);
  if (productIntent && productIntent.confidence > 0.8) {
    return productIntent;
  }

  const collectionIntent = detectCollectionQuery(question);
  if (collectionIntent && collectionIntent.confidence > 0.8) {
    return collectionIntent;
  }

  // Fallback to general query with lower confidence
  return {
    type: 'general',
    query: question,
    confidence: 0.5,
  };
}

/**
 * Extract keywords from question (for broader context search)
 */
export function extractKeywords(question: string): string[] {
  return question
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !['the', 'and', 'for', 'you', 'with', 'this', 'what', 'how'].includes(word));
}

/**
 * Get a displayable label for intent type
 */
export function getIntentLabel(intent: SearchIntent): string {
  switch (intent.type) {
    case 'attribute':
      return `Attribute Query: ${intent.key}`;
    case 'product':
      return `Product Query: ${intent.query}`;
    case 'collection':
      return `Collection Query: ${intent.query}`;
    default:
      return 'General Query';
  }
}
