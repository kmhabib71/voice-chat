well now tell me what technology are you using, what  
 files playing what role, what will be the cost? just  
 answer this in short

● 🚀 Technology Stack

Frontend (/client/)

- React - UI framework
- Styled Components - CSS-in-JS styling
- Web Audio API - Microphone recording
- WebSocket Client - Real-time communication

Backend (/server.js)

- Node.js + Express - Web server
- WebSocket - Real-time chat
- Multer - File upload handling
- OpenAI Whisper - Speech-to-text transcription
- OpenAI GPT-4o-mini - AI conversations
- ElevenLabs - Text-to-speech synthesis

Key Files & Roles

voicechat/
├── server.js # Main backend server
(WebSocket + REST API)
├── client/src/App.js # React frontend UI with voice  
 recording
├── .env # API keys and configuration  
 ├── package.json # Backend dependencies
└── client/package.json # Frontend dependencies

💰 Usage Costs

- OpenAI Whisper: ~$0.006 per minute of audio
- OpenAI GPT-4o-mini: ~$0.0001 per message
- ElevenLabs: ~$0.18 per 1000 characters of speech
- Total: ~$0.20-0.50 per conversation session

🔄 Flow

Voice → Whisper (transcription) → GPT (AI response) →  
 ElevenLabs (voice synthesis) → Browser playback
