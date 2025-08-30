# Emotional Voice Assistant

A real-time voice assistant with emotional tone detection and response capabilities.

## Features

- **Voice Recognition**: Speech-to-text using OpenAI Whisper
- **Emotion Detection**: Analyzes emotional tone from user input
- **AI Responses**: Context-aware responses using OpenAI GPT
- **Voice Synthesis**: Emotional text-to-speech using ElevenLabs
- **Real-time Communication**: WebSocket-based chat interface
- **Visual Feedback**: Emotion-responsive UI with animations

## Technology Stack

### Backend
- Node.js with Express
- WebSocket for real-time communication
- OpenAI API for speech recognition and AI responses
- ElevenLabs API for voice synthesis
- Multer for file upload handling

### Frontend
- React with Hooks
- Styled Components for responsive UI
- WebSocket client for real-time chat
- Web Audio API for recording

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key
- ElevenLabs API key

### Installation

1. **Install backend dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   npm run install:client
   ```

3. **Configure environment variables**:
   The `.env` file is already configured with the provided credentials.

### Running the Application

1. **Start the backend server**:
   ```bash
   npm run dev
   ```
   This starts the server on `http://localhost:3002`

2. **Start the frontend client** (in a new terminal):
   ```bash
   npm run dev:client
   ```
   This starts the React app on `http://localhost:3003`

## Usage

1. **Open your browser** to `http://localhost:3003`
2. **Allow microphone access** when prompted
3. **Click the microphone button** to start recording
4. **Speak your message** and click again to stop
5. **Watch the AI respond** with emotional context and voice

## API Endpoints

### REST API
- `POST /api/chat` - Send text message and get AI response
- `POST /api/transcribe` - Upload audio file for transcription
- `POST /api/speech` - Convert text to speech
- `GET /api/health` - Health check endpoint

### WebSocket
- Connect to `ws://localhost:3002` for real-time communication
- Send `voice_message` events to get AI responses
- Receive `ai_response` and `audio_response` events

## Emotion Detection

The system detects the following emotions:
- **Joy**: Happy, excited, positive emotions
- **Sadness**: Sad, depressed, down feelings
- **Anger**: Frustrated, angry, irritated states
- **Fear**: Worried, scared, anxious feelings
- **Surprise**: Amazed, shocked reactions
- **Love**: Affectionate, caring expressions
- **Neutral**: Calm, normal states

## Voice Synthesis

ElevenLabs integration provides:
- Emotional voice modulation
- High-quality speech synthesis
- Multilingual support
- Customizable voice settings per emotion

## Troubleshooting

### Common Issues

1. **Microphone not working**:
   - Ensure browser permissions are granted
   - Check if HTTPS is required for your browser
   - Try refreshing the page

2. **WebSocket connection fails**:
   - Make sure the backend server is running
   - Check firewall settings
   - Verify port 3002 is available

3. **Audio playback issues**:
   - Check browser audio settings
   - Ensure ElevenLabs API key is valid
   - Try different browsers

### Environment Variables

Make sure these are set in your `.env` file:
- `OPENAI_API_KEY` - For speech recognition and AI responses
- `ELEVENLABS_API_KEY` - For voice synthesis
- `ELEVENLABS_VOICE_ID` - Voice model to use
- `PORT` - Backend server port (default: 3002)

## Development

### Project Structure
```
voicechat/
├── server.js           # Backend server
├── package.json        # Backend dependencies
├── .env               # Environment variables
├── client/            # React frontend
│   ├── src/
│   │   ├── App.js     # Main React component
│   │   └── index.js   # React entry point
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
└── README.md          # This file
```

### Available Scripts

Backend:
- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon

Frontend:
- `npm run client` - Start React app (production)
- `npm run dev:client` - Start React app (development)

Combined:
- `npm run build` - Build React app for production
- `npm run install:client` - Install frontend dependencies

## License

MIT License - Feel free to use this project for learning and development!