import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';


function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [status, setStatus] = useState('Ready to chat');
  const [isConnected, setIsConnected] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [recognitionRestartCount, setRecognitionRestartCount] = useState(0);
  const [lastRecognitionError, setLastRecognitionError] = useState(null);
  const [lastSpeechTime, setLastSpeechTime] = useState(Date.now());
  const recognitionRestartCountRef = useRef(0);
  const recognitionRestartTimeoutRef = useRef(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const currentTranscriptRef = useRef('');
  const streamRef = useRef(null);
  const isContinuousModeRef = useRef(false); // Immediate state tracking
  const connectionAttemptRef = useRef(false); // Prevent duplicate connections
  const connectWebSocketRef = useRef(null); // Store connection function
  const chatContainerRef = useRef(null); // Reference to chat container for scrolling

  // Debug logging helper
  const debugLog = (category, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, category, message, data };
    console.log(`[DEBUG ${category.toUpperCase()}] ${message}`, data || '');
    
    setDebugInfo(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), logEntry].slice(-5) // Keep last 5 entries
    }));
  };

  // Initialize WebSocket connection
  useEffect(() => {
    let isComponentMounted = true;
    let reconnectTimeout = null;
    
    const connectWebSocket = () => {
      // Prevent multiple simultaneous connection attempts
      if (connectionAttemptRef.current) {
        debugLog('websocket', 'Connection attempt already in progress, skipping');
        return;
      }
      
      // Prevent multiple connections in development mode
      if (wsRef.current) {
        const currentState = wsRef.current.readyState;
        if (currentState === WebSocket.CONNECTING || currentState === WebSocket.OPEN) {
          debugLog('websocket', `WebSocket already connecting/connected (state: ${currentState}), skipping`);
          return;
        }
        // Close existing connection if it's in a bad state
        if (currentState === WebSocket.CLOSING || currentState === WebSocket.CLOSED) {
          debugLog('websocket', 'Cleaning up previous WebSocket connection');
          wsRef.current = null;
        }
      }
      
      connectionAttemptRef.current = true;
      debugLog('websocket', 'Attempting to connect to ws://localhost:3002');
      
      try {
        const ws = new WebSocket('ws://localhost:3002');
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            debugLog('websocket', 'Connection timeout, closing WebSocket');
            ws.close();
            connectionAttemptRef.current = false;
          }
        }, 5000); // 5 second timeout
        
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          connectionAttemptRef.current = false;
          
          if (!isComponentMounted) {
            debugLog('websocket', 'Component unmounted, closing connection');
            ws.close();
            return;
          }
          
          debugLog('websocket', 'Connected to voice assistant successfully');
          setIsConnected(true);
          setStatus('Connected - Ready to chat!');
          
          // Clear any pending reconnection attempts
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
          }
        };
        
        ws.onmessage = (event) => {
          if (!isComponentMounted) return;
          
          try {
            const data = JSON.parse(event.data);
            debugLog('websocket', 'Received message from server', data);
            
            if (data.type === 'ai_response') {
              // Immediate feedback - stop loading state
              setIsAIResponding(false);
              setStatus('Connected - Ready to chat!');
              
              debugLog('ai_response', 'Received AI response', {
                text: data.text,
                emotion: data.emotion,
                timestamp: data.timestamp
              });
              
              // Add message immediately for instant UI update
              setMessages(prev => [...prev, {
                text: data.text,
                isUser: false,
                emotion: data.emotion,
                timestamp: data.timestamp
              }]);
              setCurrentEmotion(data.emotion);
            } else if (data.type === 'audio_response') {
              debugLog('audio', 'Received audio response', {
                audioLength: data.audio?.length || 0,
                emotion: data.emotion
              });
              playAudio(data.audio);
            } else if (data.type === 'error') {
              debugLog('error', 'Server error received', data.message);
              // Don't show audio errors to user - text response is sufficient
              if (!data.message.includes('audio')) {
                setStatus(`Error: ${data.message}`);
              }
            }
          } catch (error) {
            debugLog('error', 'Error parsing WebSocket message', error);
          }
        };
        
        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          connectionAttemptRef.current = false;
          
          if (!isComponentMounted) {
            debugLog('websocket', 'Component unmounted, not attempting reconnect');
            return;
          }
          
          debugLog('websocket', `WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
          setIsConnected(false);
          
          // Only attempt reconnect for unexpected closures
          if (event.code !== 1000 && event.code !== 1001) { // Not normal or going away
            setStatus('Disconnected - Trying to reconnect...');
            
            // Exponential backoff for reconnection
            const delay = Math.min(3000 * Math.pow(1.5, (reconnectTimeout ? 1 : 0)), 30000);
            
            reconnectTimeout = setTimeout(() => {
              if (isComponentMounted && !isContinuousModeRef.current) {
                debugLog('websocket', `Attempting reconnection after ${delay}ms`);
                connectWebSocket();
              }
            }, delay);
          } else {
            setStatus('Connection closed');
          }
        };
        
        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          connectionAttemptRef.current = false;
          
          debugLog('error', 'WebSocket connection error', {
            readyState: ws.readyState,
            url: ws.url,
            error: error.type
          });
          
          setStatus('Connection error - Check if server is running');
          
          // Don't attempt immediate reconnection on error
          // Let the onclose handler manage reconnection
        };
        
        wsRef.current = ws;
        
      } catch (error) {
        connectionAttemptRef.current = false;
        debugLog('error', 'Error creating WebSocket connection', error);
        setStatus('Failed to create connection');
      }
    };

    // Store the connection function so it can be called from outside
    connectWebSocketRef.current = connectWebSocket;

    // Initial connection attempt with a small delay to ensure component is mounted
    const initialConnectionTimeout = setTimeout(() => {
      if (isComponentMounted) {
        connectWebSocket();
      }
    }, 100);
    
    return () => {
      isComponentMounted = false;
      
      // Clear all timeouts
      clearTimeout(initialConnectionTimeout);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      // Reset connection attempt flag
      connectionAttemptRef.current = false;
      
      // Close WebSocket connection
      if (wsRef.current) {
        // Set to closing state to prevent reconnection
        const ws = wsRef.current;
        wsRef.current = null;
        
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          debugLog('websocket', 'Closing WebSocket connection on cleanup');
          ws.close(1000, 'Component unmounting');
        }
      }
      
      // Cleanup continuous mode resources
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally excluding dependencies to prevent reconnections

  // Monitor continuous mode state changes and sync with ref
  useEffect(() => {
    isContinuousModeRef.current = isContinuousMode;
    debugLog('continuous', `Continuous mode state changed to: ${isContinuousMode}`);
    
    // Log the current state of all refs when continuous mode changes
    debugLog('continuous', 'Current refs state:', {
      recognition: !!recognitionRef.current,
      audioContext: !!audioContextRef.current,
      stream: !!streamRef.current,
      silenceTimer: !!silenceTimerRef.current,
      transcript: currentTranscriptRef.current
    });
  }, [isContinuousMode]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const playAudio = async (base64Audio) => {
    try {
      debugLog('audio', 'Attempting to play audio (optimized)', { audioLength: base64Audio?.length });
      const audioStartTime = Date.now();
      
      // Convert base64 to ArrayBuffer for faster processing
      const binaryString = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Create audio blob with optimized type
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        // Preload and play immediately
        audioRef.current.preload = 'auto';
        audioRef.current.src = audioUrl;
        
        // Load and play as soon as possible
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              const playbackLatency = Date.now() - audioStartTime;
              debugLog('audio', 'Audio playback started successfully', { latency: `${playbackLatency}ms` });
            })
            .catch(error => {
              debugLog('error', 'Audio playback failed', error);
              // Fallback: try again after a short delay
              setTimeout(() => {
                audioRef.current?.play().catch(e => 
                  debugLog('error', 'Audio playback retry failed', e)
                );
              }, 100);
            });
        }
        
        // Clean up URL after playback to free memory
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      debugLog('error', 'Error in optimized audio playback', error);
    }
  };

  // Manual reconnection function
  const reconnectWebSocket = () => {
    debugLog('websocket', 'Manual reconnection requested');
    
    // Reset connection attempt flag
    connectionAttemptRef.current = false;
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnection');
      wsRef.current = null;
    }
    
    // Reset states
    setIsConnected(false);
    setStatus('Reconnecting...');
    
    // Attempt new connection after a short delay
    setTimeout(() => {
      if (connectWebSocketRef.current) {
        connectWebSocketRef.current();
      }
    }, 500);
  };

  // Schedule recognition restart with backoff and limits
  const scheduleRecognitionRestart = (delay = 1000) => {
    // Clear any existing restart timeout
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
    }
    
    // Prevent too many rapid restarts
    const maxRestarts = 10;
    if (recognitionRestartCountRef.current >= maxRestarts) {
      debugLog('recovery', `Max restart attempts reached (${maxRestarts}), stopping continuous mode`);
      setStatus('❌ Too many recognition errors - Please restart continuous mode manually');
      setIsContinuousMode(false);
      isContinuousModeRef.current = false;
      return;
    }
    
    // Exponential backoff for repeated errors
    const backoffDelay = Math.min(delay * Math.pow(1.5, recognitionRestartCountRef.current), 10000);
    
    debugLog('recovery', `Scheduling recognition restart in ${backoffDelay}ms (attempt ${recognitionRestartCountRef.current + 1})`);
    
    recognitionRestartTimeoutRef.current = setTimeout(() => {
      if (!isContinuousModeRef.current) {
        debugLog('recovery', 'Restart cancelled - continuous mode disabled');
        return;
      }
      
      try {
        if (recognitionRef.current) {
          recognitionRestartCountRef.current++;
          setRecognitionRestartCount(recognitionRestartCountRef.current);
          
          debugLog('recovery', `Attempting to restart recognition (attempt ${recognitionRestartCountRef.current})`);
          recognitionRef.current.start();
          
          setStatus('Continuous mode active - Listening...');
          setLastRecognitionError(null);
          
          // Reset restart count on successful start
          setTimeout(() => {
            if (recognitionRestartCountRef.current > 0) {
              recognitionRestartCountRef.current = Math.max(0, recognitionRestartCountRef.current - 1);
              setRecognitionRestartCount(recognitionRestartCountRef.current);
            }
          }, 5000); // Reduce restart count after 5 seconds of successful operation
          
        } else {
          debugLog('recovery', 'Cannot restart - recognition object is null');
        }
      } catch (error) {
        debugLog('error', 'Failed to restart recognition', error);
        
        // If restart fails, try again with longer delay
        if (isContinuousModeRef.current && recognitionRestartCountRef.current < maxRestarts) {
          scheduleRecognitionRestart(backoffDelay * 2);
        }
      }
    }, backoffDelay);
  };

  // Setup continuous speech recognition with silence detection
  const setupContinuousRecognition = async () => {
    try {
      debugLog('continuous', 'Setting up continuous speech recognition');
      
      // Check if Web Speech API is supported
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        debugLog('error', 'Web Speech API not supported');
        setStatus('Speech recognition not supported in this browser');
        return;
      }

      // Setup audio level monitoring for silence detection FIRST
      await setupSilenceDetector();
      
      // Initialize speech recognition AFTER audio monitoring is ready
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;
      
      // Add additional configuration for better reliability
      if ('grammars' in recognitionRef.current) {
        // Some browsers support grammar lists for better recognition
        recognitionRef.current.grammars = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)();
      }
      
      // Reset restart counters for new session
      recognitionRestartCountRef.current = 0;
      setRecognitionRestartCount(0);
      setLastRecognitionError(null);

      // Handle speech results
      recognitionRef.current.onresult = (event) => {
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          }
        }
        
        if (final) {
          currentTranscriptRef.current += final;
          setLastSpeechTime(Date.now()); // Track last speech for responsiveness
          debugLog('speech', 'Final transcript added', { final, total: currentTranscriptRef.current });
        }
        
        // Reset silence timer when we hear something
        resetSilenceTimer();
      };

      recognitionRef.current.onerror = (error) => {
        debugLog('error', 'Speech recognition error', {
          error: error.error,
          message: error.message,
          timestamp: new Date().toISOString(),
          restartCount: recognitionRestartCountRef.current
        });
        
        setLastRecognitionError(error.error);
        
        // Handle different types of errors with specific strategies
        switch (error.error) {
          case 'no-speech':
            debugLog('recovery', 'No speech detected - normal in continuous mode, will auto-restart');
            // No speech is normal in continuous mode, just let onend handle restart
            break;
            
          case 'aborted':
            debugLog('recovery', 'Recognition aborted - likely due to mode change');
            // Don't restart if aborted (usually means user stopped it)
            break;
            
          case 'audio-capture':
            debugLog('recovery', 'Audio capture error - checking microphone permissions');
            setStatus('⚠️ Microphone access issue - Please check permissions');
            // Try to restart after a longer delay
            if (isContinuousModeRef.current) {
              scheduleRecognitionRestart(2000);
            }
            break;
            
          case 'not-allowed':
            debugLog('recovery', 'Microphone permission denied');
            setStatus('❌ Microphone permission denied - Please allow microphone access');
            setIsContinuousMode(false);
            isContinuousModeRef.current = false;
            break;
            
          case 'service-not-allowed':
            debugLog('recovery', 'Speech service not allowed');
            setStatus('❌ Speech recognition service blocked - Check browser settings');
            break;
            
          case 'bad-grammar':
          case 'language-not-supported':
            debugLog('recovery', 'Language/grammar error - using fallback settings');
            // Try restarting with more permissive settings
            if (isContinuousModeRef.current) {
              scheduleRecognitionRestart(1000);
            }
            break;
            
          case 'network':
            debugLog('recovery', 'Network error - will retry');
            setStatus('🌐 Network issue - Retrying recognition...');
            if (isContinuousModeRef.current) {
              scheduleRecognitionRestart(3000);
            }
            break;
            
          default:
            debugLog('recovery', `Unhandled error type: ${error.error} - will attempt restart`);
            if (isContinuousModeRef.current) {
              scheduleRecognitionRestart(1500);
            }
            break;
        }
      };
      
      // Enhanced onend handler with restart logic
      recognitionRef.current.onend = () => {
        debugLog('continuous', 'Recognition ended', {
          continuousMode: isContinuousModeRef.current,
          restartCount: recognitionRestartCountRef.current,
          lastError: lastRecognitionError
        });
        
        // Only restart if continuous mode is still active
        if (isContinuousModeRef.current) {
          scheduleRecognitionRestart(100); // Quick restart for normal end
        } else {
          debugLog('continuous', 'Recognition ended - continuous mode disabled');
        }
      };
      
      // Start recognition with error handling
      try {
        recognitionRef.current.start();
        debugLog('continuous', 'Speech recognition started successfully');
        setStatus('Continuous mode active - Listening...');
      } catch (startError) {
        debugLog('error', 'Error starting recognition immediately', startError);
        
        // Sometimes recognition needs a moment before starting
        setTimeout(() => {
          if (recognitionRef.current && isContinuousModeRef.current) {
            try {
              recognitionRef.current.start();
              debugLog('continuous', 'Speech recognition started after delay');
              setStatus('Continuous mode active - Listening...');
            } catch (retryError) {
              debugLog('error', 'Failed to start recognition after retry', retryError);
              setStatus('Error starting speech recognition - Try again');
            }
          }
        }, 500);
      }
      
    } catch (error) {
      debugLog('error', 'Error setting up continuous recognition', error);
      setStatus('Error setting up continuous recognition');
    }
  };

  // Setup silence detector using audio analysis
  const setupSilenceDetector = async () => {
    try {
      debugLog('silence', 'Setting up silence detector');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Lower sample rate for faster processing
          channelCount: 1,     // Mono for efficiency
          latency: 0.01       // 10ms latency target
        }
      });
      
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000, // Match microphone sample rate
        latencyHint: 'interactive' // Prioritize low latency
      });
      
      // Ensure audio context is running
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Smaller FFT for faster processing
      analyserRef.current.smoothingTimeConstant = 0.3; // Less smoothing for responsiveness
      source.connect(analyserRef.current);
      
      // Wait a moment for everything to be connected
      await new Promise(resolve => setTimeout(resolve, 50)); // Reduced from 100ms
      
      // Start monitoring audio levels
      debugLog('silence', 'Starting audio level monitoring');
      monitorAudioLevels();
      
      debugLog('silence', 'Silence detector setup complete');
    } catch (error) {
      debugLog('error', 'Error setting up silence detector', error);
    }
  };

  // Monitor audio levels for silence detection
  const monitorAudioLevels = () => {
    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    
    const checkAudioLevel = () => {
      // Check if continuous mode is still active and components are still mounted
      if (!analyserRef.current || !isContinuousModeRef.current) {
        debugLog('silence', `Audio monitoring stopped - continuous mode: ${isContinuousModeRef.current}, analyser: ${!!analyserRef.current}`);
        return;
      }
      
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) for audio level
      let rms = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128.0;
        rms += val * val;
      }
      rms = Math.sqrt(rms / dataArray.length);
      
      // Update audio level for visual feedback
      setAudioLevel(rms);
      
      // If volume below threshold => silence detected
      const silenceThreshold = 0.01;
      if (rms < silenceThreshold) {
        // Silence is being handled by the timer, no need to do anything here
      } else {
        // Audio detected, reset silence timer
        resetSilenceTimer();
      }
      
      // Continue monitoring only if continuous mode is still active
      if (isContinuousModeRef.current) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    checkAudioLevel();
  };

  // Reset silence timer (called when audio is detected)
  const resetSilenceTimer = () => {
    // Use ref for immediate state checking
    if (!isContinuousModeRef.current) {
      debugLog('silence', `Silence timer reset ignored - continuous mode: ${isContinuousModeRef.current}`);
      return;
    }
    
    debugLog('silence', 'Resetting silence timer');
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      // Double-check continuous mode is still active when timer fires
      if (!isContinuousModeRef.current) {
        debugLog('silence', 'Silence timer fired but continuous mode is inactive');
        return;
      }
      
      if (currentTranscriptRef.current.trim() !== '') {
        debugLog('silence', '1.5-second silence detected, processing transcript', {
          transcript: currentTranscriptRef.current.trim()
        });
        
        // Show immediate processing feedback
        setIsAIResponding(true);
        setStatus('AI is thinking...');
        
        // Process the accumulated transcript
        processTranscriptSegment(currentTranscriptRef.current.trim());
        
        // Clear the current transcript
        currentTranscriptRef.current = '';
      }
    }, 1500); // 1.5 seconds of silence for faster response
  };

  // Process transcript segment and generate AI response
  const processTranscriptSegment = async (transcript) => {
    try {
      // Ensure continuous mode is still active using ref
      if (!isContinuousModeRef.current) {
        debugLog('segment', 'Transcript processing cancelled - continuous mode inactive');
        return;
      }
      
      debugLog('segment', 'Processing transcript segment', { transcript });
      
      // Detect emotion
      const emotion = detectEmotionFromText(transcript);
      
      // Add user message to chat
      const userMessage = {
        text: transcript,
        isUser: true,
        emotion: emotion,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      debugLog('user_message', 'User message added from continuous mode', userMessage);
      
      // Send to WebSocket for AI response with optimized payload
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'voice_message',
          text: transcript,
          emotion: emotion,
          timestamp: Date.now() // Add timestamp for latency tracking
        };
        debugLog('websocket', 'Sending continuous transcript to server', { text: transcript, emotion });
        wsRef.current.send(JSON.stringify(messageData));
      } else {
        debugLog('error', 'WebSocket not connected for continuous mode');
      }
      
    } catch (error) {
      debugLog('error', 'Error processing transcript segment', error);
    }
  };

  // Simple emotion detection (can be enhanced)
  const detectEmotionFromText = (text) => {
    const emotions = {
      joy: ['happy', 'excited', 'wonderful', 'amazing', 'great', 'fantastic', 'awesome', 'brilliant'],
      sadness: ['sad', 'depressed', 'unhappy', 'down', 'miserable', 'upset', 'crying'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'hate'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'wow', 'incredible'],
      love: ['love', 'adore', 'cherish', 'romantic', 'affection', 'heart', 'caring'],
      neutral: ['okay', 'fine', 'normal', 'regular', 'standard', 'average']
    };

    const textLower = text.toLowerCase();
    let detectedEmotion = 'neutral';
    let maxMatches = 0;

    for (const [emotion, keywords] of Object.entries(emotions)) {
      const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedEmotion = emotion;
      }
    }

    return detectedEmotion;
  };

  // Toggle continuous mode
  const toggleContinuousMode = async () => {
    debugLog('continuous', `Toggle continuous mode called - current state: ${isContinuousMode}`);
    
    if (isContinuousMode) {
      // Stop continuous mode
      debugLog('continuous', 'Stopping continuous mode');
      setIsContinuousMode(false);
      isContinuousModeRef.current = false;
      setStatus('Continuous mode stopped');
      setAudioLevel(0);
      
      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          debugLog('continuous', 'Speech recognition stopped');
        } catch (error) {
          debugLog('error', 'Error stopping speech recognition', error);
        }
      }
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        debugLog('continuous', 'Silence timer cleared');
      }
      
      // Clear recognition restart timeout
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current);
        recognitionRestartTimeoutRef.current = null;
        debugLog('continuous', 'Recognition restart timeout cleared');
      }
      
      // Reset restart counters
      recognitionRestartCountRef.current = 0;
      setRecognitionRestartCount(0);
      setLastRecognitionError(null);
      
      // Stop audio stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          debugLog('continuous', `Stopped audio track: ${track.label}`);
        });
        streamRef.current = null;
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
          debugLog('continuous', 'Audio context closed');
        } catch (error) {
          debugLog('error', 'Error closing audio context', error);
        }
        audioContextRef.current = null;
      }
      
      // Clear current transcript
      currentTranscriptRef.current = '';
      
    } else {
      // Start continuous mode
      debugLog('continuous', 'Starting continuous mode');
      
      // Ensure we have a stable WebSocket connection
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        debugLog('error', `Cannot start continuous mode - WebSocket state: ${wsRef.current?.readyState || 'null'}`);
        setStatus('Error: Not connected to server - Check connection');
        return;
      }
      
      // Set state AND ref immediately
      setIsContinuousMode(true);
      isContinuousModeRef.current = true;
      setStatus('Continuous mode active - Speak naturally, I\'ll respond after 3 seconds of silence');
      currentTranscriptRef.current = '';
      
      // Give React a moment to update the state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        await setupContinuousRecognition();
        
        // Start an initial silence timer to catch the first period of silence
        resetSilenceTimer();
        
        debugLog('continuous', 'Continuous mode setup completed successfully');
      } catch (error) {
        debugLog('error', 'Error setting up continuous mode', error);
        setIsContinuousMode(false);
        setStatus('Error setting up continuous mode');
      }
    }
  };

  const startRecording = async () => {
    try {
      debugLog('microphone', 'Requesting microphone access');
      
      // Get available audio devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      debugLog('microphone', 'Available audio input devices', audioInputs.map(d => ({
        deviceId: d.deviceId,
        label: d.label || 'Unknown device',
        kind: d.kind
      })));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Log which device is being used
      const audioTrack = stream.getAudioTracks()[0];
      debugLog('microphone', 'Using audio device', {
        label: audioTrack.label,
        settings: audioTrack.getSettings(),
        capabilities: audioTrack.getCapabilities()
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        debugLog('recording', 'Audio data chunk received', { size: event.data.size });
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        debugLog('recording', 'Recording stopped, processing audio');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        debugLog('recording', 'Created audio blob', { size: audioBlob.size });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => {
          debugLog('microphone', 'Stopping audio track', { label: track.label });
          track.stop();
        });
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus('Listening...');
      debugLog('recording', 'Recording started successfully');
    } catch (error) {
      debugLog('error', 'Error starting recording', error);
      setStatus('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      debugLog('recording', 'Stopping recording');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Processing...');
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsProcessing(true);
      debugLog('transcription', 'Starting transcription', { blobSize: audioBlob.size });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      debugLog('transcription', 'Sending to /api/transcribe endpoint');
      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      debugLog('transcription', 'Transcription response received', response.data);
      const transcription = response.data;
      const userMessage = {
        text: transcription.text,
        isUser: true,
        emotion: transcription.emotion,
        timestamp: transcription.timestamp
      };
      
      setMessages(prev => [...prev, userMessage]);
      debugLog('user_message', 'User message added', userMessage);
      
      // Send to WebSocket for AI response
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const messageData = {
          type: 'voice_message',
          text: transcription.text,
          emotion: transcription.emotion
        };
        debugLog('websocket', 'Sending message to server', messageData);
        wsRef.current.send(JSON.stringify(messageData));
      } else {
        debugLog('error', 'WebSocket not connected', { readyState: wsRef.current?.readyState });
      }
      
      setStatus('Ready to chat');
    } catch (error) {
      debugLog('error', 'Error transcribing audio', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setStatus('Error processing speech');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual restart function for speech recognition
  const manualRestartRecognition = () => {
    debugLog('manual', 'Manual recognition restart requested');
    
    // Reset error states
    setLastRecognitionError(null);
    recognitionRestartCountRef.current = 0;
    setRecognitionRestartCount(0);
    
    // Clear any pending restart
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
      recognitionRestartTimeoutRef.current = null;
    }
    
    // Stop current recognition if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        debugLog('manual', 'Error stopping recognition for manual restart', error);
      }
    }
    
    // Restart after a brief delay
    setTimeout(() => {
      if (isContinuousModeRef.current) {
        scheduleRecognitionRestart(100);
        setStatus('Manually restarting speech recognition...');
      }
    }, 300);
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    
    const userMessage = {
      text: textInput,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    debugLog('text_message', 'Text message sent', userMessage);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'voice_message',
        text: textInput
      };
      debugLog('websocket', 'Sending text message to server', messageData);
      wsRef.current.send(JSON.stringify(messageData));
    } else {
      debugLog('error', 'Cannot send text message - WebSocket not connected');
    }
    
    setTextInput('');
  };

  const handleVoiceButtonClick = () => {
    if (isContinuousMode) {
      toggleContinuousMode();
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleContinuousModeToggle = () => {
    toggleContinuousMode();
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😰',
      surprise: '😲',
      love: '😍',
      neutral: '😐'
    };
    return emojis[emotion] || '😐';
  };

  return (
    <div className="container">
      <h1 className="title">Emotional Voice Assistant</h1>
      <p className="subtitle">Talk to me and I'll respond with emotion!</p>
      
      <div className="emotion-indicator">
        Current mood: {getEmotionEmoji(currentEmotion)} {currentEmotion}
      </div>
      
      <div className="status-indicator">
        Status: {status} {isConnected ? '🟢' : '🔴'}
        {!isConnected && (
          <button 
            onClick={reconnectWebSocket}
            className="retry-button"
          >
            Retry
          </button>
        )}
        {isContinuousMode && (lastRecognitionError || recognitionRestartCount > 3) && (
          <button 
            onClick={manualRestartRecognition}
            className="fix-speech-button"
          >
            🔄 Fix Speech
          </button>
        )}
      </div>
      
      <button 
        className={`continuous-mode-button ${isContinuousMode ? 'active' : 'inactive'}`}
        onClick={handleContinuousModeToggle}
        disabled={!isConnected || isProcessing}
      >
        {isContinuousMode ? '🛑 Stop Continuous Mode' : '🔄 Start Continuous Mode'}
      </button>
      
      <div 
        className={`audio-level-indicator ${isContinuousMode ? 'visible' : 'hidden'}`}
        style={{ '--level': `${Math.min(audioLevel * 100, 100)}%` }}
      />
      
      <div className="waveform-container">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className={`wave-bar ${isRecording ? 'active' : 'inactive'} delay-${i * 100}`}
          />
        ))}
      </div>
      
      <button
        className={`voice-button ${isRecording || isContinuousMode ? 'recording' : ''} ${currentEmotion}`}
        onClick={handleVoiceButtonClick}
        disabled={!isConnected || isProcessing}
      >
        {isContinuousMode ? '🎙️' : (isRecording ? '🛑' : '🎤')}
      </button>
      
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'assistant'}`}>
            {message.isUser ? '👤 ' : '🤖 '}
            {message.text}
            {message.emotion && !message.isUser && (
              <span style={{ marginLeft: '10px' }}>
                {getEmotionEmoji(message.emotion)}
              </span>
            )}
          </div>
        ))}
        
        <div className={`typing-indicator ${isAIResponding ? 'visible' : 'hidden'}`}>
          🤖 AI is thinking...
        </div>
        
        {messages.length === 0 && !isAIResponding && (
          <div className="empty-state">
            Start a conversation by pressing the microphone button or typing below!
          </div>
        )}
      </div>
      
      <div className="input-container">
        <input
          className="text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or type your message here..."
          onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
          disabled={!isConnected}
        />
        <button 
          className="send-button"
          onClick={sendTextMessage}
          disabled={!textInput.trim() || !isConnected}
        >
          Send
        </button>
      </div>
      
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }}
        preload="auto"
        controls={false}
        muted={false}
        autoPlay={false}
        crossOrigin="anonymous"
        onLoadStart={() => debugLog('audio', 'Audio loading started')}
        onCanPlay={() => debugLog('audio', 'Audio can play')}
        onLoadedData={() => debugLog('audio', 'Audio data loaded')}
      />
      
      {/* Debug Panel */}
      <div className="debug-panel">
        <strong>🐛 Debug Info</strong>
        <div>Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
        <div>WebSocket State: {wsRef.current ? wsRef.current.readyState : 'null'}</div>
        <div>Recording: {isRecording ? '🎤 Recording' : '⏹️ Stopped'}</div>
        <div>Continuous: {isContinuousMode ? '🔄 Active' : '⏸️ Inactive'}</div>
        <div>AI Status: {isAIResponding ? '⏳ Thinking' : '✅ Ready'}</div>
        <div>Audio Level: {(audioLevel * 100).toFixed(1)}%</div>
        <div>Emotion: {currentEmotion}</div>
        <div>Last Speech: {Math.round((Date.now() - lastSpeechTime) / 1000)}s ago</div>
        <div>Recognition Restarts: {recognitionRestartCount}</div>
        {lastRecognitionError && (
          <div className="error-text">Last Error: {lastRecognitionError}</div>
        )}
        <div>Status: {status}</div>
        <div style={{ marginTop: '10px' }}>
          <strong>Recent Logs:</strong>
          {Object.entries(debugInfo).slice(-3).map(([category, logs]) => 
            logs.slice(-1).map((log, i) => (
              <div key={`${category}-${i}`} style={{ fontSize: '10px', opacity: 0.8 }}>
                [{category.toUpperCase()}] {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;