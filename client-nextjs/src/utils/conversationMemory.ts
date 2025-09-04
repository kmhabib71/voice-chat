// Conversation Memory Management System
// Efficient keyword-based conversation memory with local storage persistence

interface KeywordData {
  count: number;
  lastSeen: number;
  contexts: string[];
  firstSeen: number;
}

interface MemoryKeywords {
  entities: Map<string, KeywordData>;
  topics: Map<string, KeywordData>;
  intents: Map<string, KeywordData>;
  emotions: Map<string, KeywordData>;
  context: Map<string, KeywordData>;
  [key: string]: Map<string, KeywordData>; // Index signature for dynamic access
}

interface SessionData {
  messageCount: number;
  startTime: number;
  lastActive: number;
  dominantTopics: string[];
  conversationTone: string;
}

interface RecentMessage {
  text: string;
  keywords: any;
  timestamp: number;
  isUser: boolean;
  emotion: string;
}

interface MemoryData {
  sessionId: string;
  keywords: MemoryKeywords;
  recentMessages: RecentMessage[];
  session: SessionData;
}

interface KeywordExtractionResult {
  entities: string[];
  topics: string[];
  intents: string[];
  emotions: string[];
  context: string[];
  [key: string]: string[]; // Index signature for dynamic access
}

class ConversationMemory {
  private sessionId: string;
  private storageKey: string;
  private maxRecentMessages: number;
  private keywordDecayFactor: number;
  private memory: MemoryData;
  private debugEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.storageKey = 'conversation_memory';
    this.maxRecentMessages = 8; // Store last 8 messages with keywords
    this.keywordDecayFactor = 0.95; // Slight decay for older keywords

    // Load existing memory or initialize
    this.memory = this.loadFromStorage() || this.initializeMemory();

    // Debug logging
    this.debugEnabled = process.env.NODE_ENV === 'development';
  }

  // Initialize empty memory structure
  initializeMemory() {
    return {
      sessionId: this.sessionId,
      keywords: {
        entities: new Map(),
        topics: new Map(),
        intents: new Map(),
        emotions: new Map(),
        context: new Map(),
      },
      recentMessages: [],
      session: {
        messageCount: 0,
        startTime: Date.now(),
        lastActive: Date.now(),
        dominantTopics: [],
        conversationTone: 'neutral',
      },
    };
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Debug logging helper
  debugLog(message: string, data: any = null): void {
    if (this.debugEnabled) {
      console.log(`[ConversationMemory] ${message}`, data || '');
    }
  }

  // Load memory from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Convert Maps back from stored objects
        if (parsed.keywords) {
          Object.keys(parsed.keywords).forEach(category => {
            if (
              parsed.keywords[category] &&
              typeof parsed.keywords[category] === 'object'
            ) {
              parsed.keywords[category] = new Map(
                Object.entries(parsed.keywords[category])
              );
            }
          });
        }

        this.debugLog('Memory loaded from storage', {
          messageCount: parsed.session?.messageCount || 0,
          keywordCategories: Object.keys(parsed.keywords || {}),
        });

        return parsed;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('Error loading memory from storage', errorMessage);
    }
    return null;
  }

  // Save memory to localStorage
  saveToStorage() {
    try {
      // Convert Maps to objects for JSON serialization
      const memoryForStorage = {
        ...this.memory,
        keywords: {},
      };

      Object.keys(this.memory.keywords).forEach(category => {
        if (this.memory.keywords[category] instanceof Map) {
          memoryForStorage.keywords[category] = Object.fromEntries(
            this.memory.keywords[category]
          );
        }
      });

      localStorage.setItem(this.storageKey, JSON.stringify(memoryForStorage));
      this.debugLog('Memory saved to storage');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('Error saving memory to storage', errorMessage);
    }
  }

  // Extract keywords from text using server API
  async extractKeywords(text: string, contextTopics: string[] = []): Promise<KeywordExtractionResult> {
    try {
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          context: contextTopics,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.keywords;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('Error extracting keywords', errorMessage);

      // Fallback: basic keyword extraction with actual emotion detection
      const fallbackEmotion = this.detectEmotionFromText(text);
      return {
        entities: [],
        topics: [text.split(' ').slice(0, 3).join(' ')],
        intents: ['statement'],
        emotions: [fallbackEmotion],
        context: ['general'],
      };
    }
  }

  // Update keyword frequencies with decay
  updateKeywordFrequency(category: string, keyword: string, increment: number = 1): void {
    if (!this.memory.keywords[category]) {
      this.memory.keywords[category] = new Map();
    }

    const existing = this.memory.keywords[category].get(keyword) || {
      count: 0,
      lastSeen: 0,
      contexts: [],
      firstSeen: Date.now(),
    };

    // Apply decay to existing count based on time
    const timeDiff = Date.now() - existing.lastSeen;
    const decayFactor = Math.pow(
      this.keywordDecayFactor,
      timeDiff / (24 * 60 * 60 * 1000)
    ); // Daily decay

    this.memory.keywords[category].set(keyword, {
      ...existing,
      count: existing.count * decayFactor + increment,
      lastSeen: Date.now(),
    });
  }

  // Process new message and update memory
  async processMessage(text: string, isUser: boolean = true, emotion: string = 'neutral'): Promise<any> {
    try {
      this.debugLog('Processing message', {
        text: text.substring(0, 50) + '...',
        isUser,
        emotion,
      });

      // Get current dominant topics for context
      const currentTopics = this.getDominantTopics(3);

      // Extract keywords from the message
      const keywords = await this.extractKeywords(text, currentTopics);

      // Update keyword frequencies
      Object.keys(keywords).forEach(category => {
        if (Array.isArray(keywords[category])) {
          keywords[category].forEach(keyword => {
            if (keyword && keyword.trim()) {
              this.updateKeywordFrequency(
                category,
                keyword.toLowerCase().trim()
              );
            }
          });
        }
      });

      // Add to recent messages with keywords
      const messageWithKeywords = {
        text,
        keywords,
        timestamp: Date.now(),
        isUser,
        emotion,
      };

      this.memory.recentMessages.push(messageWithKeywords);

      // Keep only recent messages (sliding window)
      if (this.memory.recentMessages.length > this.maxRecentMessages) {
        this.memory.recentMessages = this.memory.recentMessages.slice(
          -this.maxRecentMessages
        );
      }

      // Update session metadata
      this.memory.session.messageCount++;
      this.memory.session.lastActive = Date.now();
      this.memory.session.dominantTopics = this.getDominantTopics(5);
      this.memory.session.conversationTone = this.inferConversationTone();

      // Save to storage
      this.saveToStorage();

      this.debugLog('Message processed', {
        keywordsExtracted: Object.keys(keywords).reduce(
          (acc, key) => {
            // Only count arrays (entities, topics, intents, emotions, context)
            if (Array.isArray(keywords[key])) {
              return acc + keywords[key].length;
            }
            return acc;
          },
          0
        ),
        totalMessages: this.memory.recentMessages.length,
        dominantTopics: this.memory.session.dominantTopics,
      });

      return {
        extractedKeywords: keywords,
        memoryUpdated: true,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('Error processing message', errorMessage);
      return {
        extractedKeywords: null,
        memoryUpdated: false,
        error: errorMessage,
      };
    }
  }

  // Get dominant topics by frequency
  getDominantTopics(limit = 5) {
    if (!this.memory.keywords.topics) return [];

    return Array.from(this.memory.keywords.topics.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([topic]) => topic);
  }

  // Get dominant entities by frequency
  getDominantEntities(limit = 5) {
    if (!this.memory.keywords.entities) return [];

    return Array.from(this.memory.keywords.entities.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([entity]) => entity);
  }

  // Infer overall conversation tone from emotions and intents
  inferConversationTone() {
    const emotions = this.memory.keywords.emotions || new Map();
    const intents = this.memory.keywords.intents || new Map();

    // Get top emotion and intent
    const topEmotion = Array.from(emotions.entries()).sort(
      (a, b) => b[1].count - a[1].count
    )[0];
    const topIntent = Array.from(intents.entries()).sort(
      (a, b) => b[1].count - a[1].count
    )[0];

    // Simple tone inference
    if (topEmotion) {
      const [emotion] = topEmotion;
      if (['joy', 'love', 'surprise'].includes(emotion)) return 'positive';
      if (['sadness', 'anger', 'fear'].includes(emotion)) return 'concerned';
    }

    if (topIntent) {
      const [intent] = topIntent;
      if (intent === 'question') return 'inquisitive';
      if (intent === 'request') return 'goal-oriented';
    }

    return 'neutral';
  }

  // Build context for AI using memory
  buildContextForAI(userQuery: string): any {
    try {
      // Get relevant information from memory
      const topTopics = this.getDominantTopics(3);
      const topEntities = this.getDominantEntities(3);
      const recentMessages = this.memory.recentMessages.slice(-3);

      // Build compact context prompt
      let contextPrompt = '';

      if (topTopics.length > 0) {
        contextPrompt += `User often discusses: ${topTopics.join(', ')}. `;
      }

      if (topEntities.length > 0) {
        contextPrompt += `Key entities: ${topEntities.join(', ')}. `;
      }

      if (this.memory.session.conversationTone !== 'neutral') {
        contextPrompt += `Conversation tone: ${this.memory.session.conversationTone}. `;
      }

      if (recentMessages.length > 0) {
        const recentContext = recentMessages
          .map(
            msg =>
              `"${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}"`
          )
          .join(', ');
        contextPrompt += `Recent context: ${recentContext}. `;
      }

      this.debugLog('Context built for AI', {
        promptLength: contextPrompt.length,
        topicsIncluded: topTopics.length,
        entitiesIncluded: topEntities.length,
      });

      return {
        contextPrompt: contextPrompt.trim(),
        relevantKeywords: {
          topics: topTopics,
          entities: topEntities,
          tone: this.memory.session.conversationTone,
        },
        tokenCount: Math.ceil(contextPrompt.length / 4), // Rough token estimate
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.debugLog('Error building context for AI', errorMessage);
      return {
        contextPrompt: '',
        relevantKeywords: {},
        tokenCount: 0,
      };
    }
  }

  // Get memory statistics for debugging
  getMemoryStats() {
    const stats = {
      sessionId: this.memory.sessionId,
      messageCount: this.memory.session.messageCount,
      recentMessagesCount: this.memory.recentMessages.length,
      keywordStats: {},
      sessionDuration: Date.now() - this.memory.session.startTime,
      dominantTopics: this.memory.session.dominantTopics,
      conversationTone: this.memory.session.conversationTone,
    };

    // Count keywords by category
    Object.keys(this.memory.keywords).forEach(category => {
      if (this.memory.keywords[category] instanceof Map) {
        stats.keywordStats[category] = this.memory.keywords[category].size;
      }
    });

    return stats;
  }

  // Clear memory (for testing or reset)
  clearMemory() {
    this.memory = this.initializeMemory();
    this.saveToStorage();
    this.debugLog('Memory cleared');
  }

  // Simple emotion detection (client-side fallback)
  detectEmotionFromText(text: string): string {
    const emotions = {
      joy: [
        'happy',
        'excited',
        'wonderful',
        'amazing',
        'great',
        'fantastic',
        'awesome',
        'brilliant',
      ],
      sadness: [
        'sad',
        'depressed',
        'unhappy',
        'down',
        'miserable',
        'upset',
        'crying',
      ],
      anger: [
        'angry',
        'mad',
        'furious',
        'annoyed',
        'frustrated',
        'irritated',
        'hate',
      ],
      fear: [
        'scared',
        'afraid',
        'worried',
        'anxious',
        'nervous',
        'terrified',
        'panic',
      ],
      surprise: [
        'surprised',
        'amazed',
        'shocked',
        'astonished',
        'wow',
        'incredible',
      ],
      love: [
        'love',
        'adore',
        'cherish',
        'romantic',
        'affection',
        'heart',
        'caring',
      ],
      neutral: ['okay', 'fine', 'normal', 'regular', 'standard', 'average'],
    };

    const textLower = text.toLowerCase();
    let detectedEmotion = 'neutral';
    let maxMatches = 0;

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const matches = keywords.filter(keyword =>
        textLower.includes(keyword)
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedEmotion = emotion;
      }
    }

    return detectedEmotion;
  }

  // Export memory for debugging
  exportMemory() {
    const exported = {
      ...this.memory,
      keywords: {},
    };

    Object.keys(this.memory.keywords).forEach(category => {
      if (this.memory.keywords[category] instanceof Map) {
        exported.keywords[category] = Object.fromEntries(
          this.memory.keywords[category]
        );
      }
    });

    return exported;
  }
}

export default ConversationMemory;
