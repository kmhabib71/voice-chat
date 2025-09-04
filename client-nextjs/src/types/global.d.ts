// Global type declarations for browser APIs and custom properties

// ===== API TYPES =====
interface KeywordExtractionRequest {
  text: string;
  maxKeywords?: number;
}

interface KeywordExtractionResponse {
  keywords: string[];
  success: boolean;
  error?: string;
}

interface AudioGenerationRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
}

interface AudioGenerationResponse {
  audioBuffer?: ArrayBuffer;
  success: boolean;
  error?: string;
}

// ===== WEBSOCKET TYPES =====
interface WebSocketEvents {
  // Client to Server
  'audio-chunk': ArrayBuffer;
  'start-recording': void;
  'stop-recording': void;
  'generate-audio': { text: string };
  
  // Server to Client
  'transcription': { text: string; isFinal: boolean };
  'ai-response': { text: string };
  'audio-generated': ArrayBuffer;
  'error': { message: string; type: string };
  'connection-status': { connected: boolean };
}

// ===== CONVERSATION MEMORY TYPES =====
interface ConversationEntry {
  id: string;
  timestamp: number;
  text: string;
  isUser: boolean;
  emotion?: string;
  keywords?: string[];
}

interface MemoryStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  uniqueKeywords: number;
  totalKeywords: number;
  avgKeywordsPerMessage: number;
  memorySize: string;
}

interface KeywordMap {
  [keyword: string]: number[];
}

interface ExportedMemory {
  conversation: ConversationEntry[];
  keywords: KeywordMap;
  stats: MemoryStats;
  exportDate: string;
}

// ===== VOICE CHAT TYPES =====
interface VoiceChatState {
  isListening: boolean;
  isProcessing: boolean;
  isConnected: boolean;
  currentTranscript: string;
  conversation: ConversationEntry[];
  error: string | null;
}

interface AudioContextState {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  microphone: MediaStreamAudioSourceNode | null;
  processor: ScriptProcessorNode | null;
  stream: MediaStream | null;
}

interface VisualizationData {
  levels: number[];
  frequency: Uint8Array;
  waveform: Uint8Array;
}

// ===== SPEECH RECOGNITION TYPES =====

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var SpeechGrammarList: any;
declare var webkitSpeechGrammarList: any;

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof webkitSpeechRecognition;
  SpeechGrammarList: any;
  webkitSpeechGrammarList: any;
  webkitAudioContext: typeof AudioContext;
  debugMemory?: () => any;
  clearMemory?: () => void;
}

// ConversationMemory class type
declare class ConversationMemory {
  constructor();
  processMessage(text: string, isUser?: boolean, emotion?: string): Promise<any>;
  getMemoryStats(): any;
  exportMemory(): any;
  clearMemory(): void;
}

// Custom CSS properties for styled components
declare module 'react' {
  interface CSSProperties {
    '--level'?: string;
    [key: `--${string}`]: string | undefined;
  }
}

// Socket.io types
interface Socket {
  id: string;
  connected: boolean;
  io: {
    engine: {
      transport: {
        name: string;
      };
    };
  };
  emit(event: string, data?: any): void;
  on(event: string, callback: (data?: any) => void): void;
  disconnect(): void;
}

// MediaTrackConstraints extension
interface MediaTrackConstraints {
  latency?: number;
}