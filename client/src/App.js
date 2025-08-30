import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import axios from 'axios';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const wave = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  text-align: center;
  opacity: 0.9;
`;

const VoiceButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isRecording', 'emotion'].includes(prop)
})`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: none;
  background: ${props => {
    const colors = {
      neutral: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      joy: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      sadness: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      anger: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      fear: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      surprise: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      love: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    };
    return colors[props.emotion] || colors.neutral;
  }};
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  animation: ${props => props.isRecording ? pulse : 'none'} 1s infinite;
  margin-bottom: 30px;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Message = styled.div`
  margin-bottom: 15px;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 80%;
  word-wrap: break-word;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin-left: auto;
    color: white;
  ` : `
    background: rgba(255, 255, 255, 0.9);
    margin-right: auto;
    color: #333;
  `}
`;

const EmotionIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
`;

const StatusIndicator = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 20px;
  text-align: center;
`;

const WaveformContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  height: 40px;
  margin-bottom: 20px;
`;

const WaveBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive', 'delay'].includes(prop)
})`
  width: 4px;
  height: ${props => props.isActive ? '20px' : '8px'};
  background: white;
  border-radius: 2px;
  animation: ${props => props.isActive ? wave : 'none'} 0.8s ease-in-out infinite;
  animation-delay: ${props => props.delay}ms;
  transition: height 0.3s ease;
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 600px;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  outline: none;
  
  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [status, setStatus] = useState('Ready to chat');
  const [isConnected, setIsConnected] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const audioRef = useRef(null);

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
    const connectWebSocket = () => {
      debugLog('websocket', 'Attempting to connect to ws://localhost:3002');
      const ws = new WebSocket('ws://localhost:3002');
      
      ws.onopen = () => {
        debugLog('websocket', 'Connected to voice assistant successfully');
        setIsConnected(true);
        setStatus('Connected - Ready to chat!');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        debugLog('websocket', 'Received message from server', data);
        
        if (data.type === 'ai_response') {
          debugLog('ai_response', 'Received AI response', {
            text: data.text,
            emotion: data.emotion,
            timestamp: data.timestamp
          });
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
          setStatus(`Error: ${data.message}`);
        }
      };
      
      ws.onclose = () => {
        debugLog('websocket', 'Disconnected from voice assistant');
        setIsConnected(false);
        setStatus('Disconnected - Trying to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        debugLog('error', 'WebSocket connection error', error);
        setStatus('Connection error');
      };
      
      wsRef.current = ws;
    };

    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const playAudio = (base64Audio) => {
    try {
      debugLog('audio', 'Attempting to play audio', { audioLength: base64Audio?.length });
      const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], {
        type: 'audio/mpeg'
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => debugLog('audio', 'Audio playback started successfully'))
          .catch(error => debugLog('error', 'Audio playback failed', error));
      }
    } catch (error) {
      debugLog('error', 'Error creating audio blob', error);
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
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
    <>
      <GlobalStyle />
      <Container>
        <Title>Emotional Voice Assistant</Title>
        <Subtitle>Talk to me and I'll respond with emotion!</Subtitle>
        
        <EmotionIndicator>
          Current mood: {getEmotionEmoji(currentEmotion)} {currentEmotion}
        </EmotionIndicator>
        
        <StatusIndicator>
          Status: {status} {isConnected ? '🟢' : '🔴'}
        </StatusIndicator>
        
        <WaveformContainer>
          {[...Array(8)].map((_, i) => (
            <WaveBar 
              key={i} 
              isActive={isRecording} 
              delay={i * 100}
            />
          ))}
        </WaveformContainer>
        
        <VoiceButton
          onClick={handleVoiceButtonClick}
          isRecording={isRecording}
          emotion={currentEmotion}
          disabled={!isConnected || isProcessing}
        >
          {isRecording ? '🛑' : '🎤'}
        </VoiceButton>
        
        <ChatContainer>
          {messages.map((message, index) => (
            <Message key={index} isUser={message.isUser}>
              {message.isUser ? '👤 ' : '🤖 '}
              {message.text}
              {message.emotion && !message.isUser && (
                <span style={{ marginLeft: '10px' }}>
                  {getEmotionEmoji(message.emotion)}
                </span>
              )}
            </Message>
          ))}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.7, marginTop: '50px' }}>
              Start a conversation by pressing the microphone button or typing below!
            </div>
          )}
        </ChatContainer>
        
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          <TextInput
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your message here..."
            onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
            disabled={!isConnected}
          />
          <SendButton 
            onClick={sendTextMessage}
            disabled={!textInput.trim() || !isConnected}
          >
            Send
          </SendButton>
        </div>
        
        <audio ref={audioRef} style={{ display: 'none' }} />
        
        {/* Debug Panel */}
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '15px', 
          borderRadius: '10px',
          fontSize: '12px',
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto',
          fontFamily: 'monospace'
        }}>
          <strong>🐛 Debug Info</strong>
          <div>Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
          <div>Recording: {isRecording ? '🎤 Recording' : '⏹️ Stopped'}</div>
          <div>Processing: {isProcessing ? '⏳ Processing' : '✅ Ready'}</div>
          <div>Emotion: {currentEmotion}</div>
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
      </Container>
    </>
  );
}

export default App;