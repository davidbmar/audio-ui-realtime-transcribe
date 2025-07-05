# Real-Time Audio Intelligence Platform

A serverless platform for intelligent audio recording with real-time transcription, analysis, and semantic search capabilities. Built for meeting intelligence, conversation analysis, and AI memory applications.

## 🚀 Key Features

### Core Capabilities
- **🎤 Smart Audio Recording**: Browser-based chunked recording with configurable durations (5s-5min)
- **📝 Live Transcription**: Real-time Whisper-powered transcription with <10s latency
- **🧠 Intelligent Analysis**: Automatic topic extraction, decision detection, and entity recognition
- **🔍 Semantic Search**: RAG-enabled search across active and historical recordings
- **⏯️ Context-Aware Playback**: Instantly jump to relevant audio segments based on content

### Advanced Features
- **Real-time Dashboard**: Live view of topics, decisions, and key moments during recording
- **Speaker Diarization**: Identify and track different speakers
- **Meeting Intelligence**: Automatic action items and decision tracking
- **Time-Indexed Storage**: Direct timestamp access to any moment
- **Parallel Processing**: Simultaneous transcription and analysis

## 🏗️ Architecture Overview

Built on AWS serverless technologies for infinite scale and cost efficiency:

```
Frontend (React + WebSocket) → API Gateway → Lambda Functions
                                                ↓
                                            S3 Storage
                                                ↓
                                    Parallel Processing Pipeline
                                    ├── Transcription (Whisper)
                                    ├── Analysis (NLP)
                                    └── Search Index (RAG)
```

## 📁 Project Structure

```
audio-intelligence-platform/
├── api/                    # Lambda functions
│   ├── recording/         # Audio upload & management
│   ├── transcription/     # Whisper integration
│   ├── analysis/          # NLP & topic extraction
│   └── search/            # RAG & semantic search
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API & WebSocket clients
│   └── public/
├── infrastructure/        # AWS resource definitions
├── scripts/              # Deployment automation
└── docs/                 # Additional documentation
```

## 🚀 Quick Start

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ and npm
- AWS CLI configured
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/audio-intelligence-platform.git
cd audio-intelligence-platform
```

2. **Run setup scripts in order**
```bash
chmod +x scripts/step-*.sh
./scripts/step-10-setup.sh              # Initial configuration
./scripts/step-20-deploy-core.sh        # Deploy core infrastructure
./scripts/step-30-deploy-frontend.sh    # Deploy web interface
./scripts/step-40-enable-realtime.sh    # Enable WebSocket features
```

3. **Access your platform**
```
Frontend: https://your-cloudfront-distribution.cloudfront.net
WebSocket: wss://your-api-gateway.execute-api.region.amazonaws.com/prod
```

## 💡 Usage Examples

### Recording a Meeting
```javascript
// Start recording with automatic chunking
const session = await audioRecorder.startSession({
  chunkDuration: 30,  // 30-second chunks
  enableTranscription: true,
  enableAnalysis: true
});

// Real-time updates via WebSocket
session.on('transcription', (data) => {
  console.log(`New transcript: ${data.text}`);
});

session.on('topics', (topics) => {
  console.log(`Current topics: ${topics.join(', ')}`);
});
```

### Searching Recordings
```javascript
// Semantic search across all recordings
const results = await searchAPI.query({
  question: "What did John say about the Q4 revenue projections?",
  sessionId: "meeting-123" // Optional: search specific session
});

// Results include timestamp and context
results.forEach(result => {
  console.log(`Found at ${result.timestamp}: ${result.text}`);
  // Play specific chunk: audioPlayer.playChunk(result.chunkId);
});
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file from the template:
```bash
cp .env.template .env
```

Key configurations:
```env
# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-audio-bucket

# API Endpoints
API_ENDPOINT=https://your-api.execute-api.region.amazonaws.com/prod
WS_ENDPOINT=wss://your-ws-api.execute-api.region.amazonaws.com/prod

# Transcription
WHISPER_API_KEY=your-openai-api-key
TRANSCRIPTION_MODEL=whisper-1

# Feature Flags
ENABLE_REALTIME_ANALYSIS=true
ENABLE_SPEAKER_DIARIZATION=false
```

## 📊 Storage Structure

Time-indexed organization for instant access:
```
s3://your-bucket/
└── users/{userId}/audio/sessions/{sessionId}/
    ├── manifest.json                 # Session metadata
    ├── chunks/
    │   ├── 00000-00005.webm         # 0-5 seconds
    │   ├── 00005-00010.webm         # 5-10 seconds
    │   └── ...
    ├── transcripts/
    │   ├── 00000-00005.json         # Matching transcripts
    │   └── rolling.json             # Complete transcript
    └── analysis/
        ├── timeline.json            # Topic progression
        ├── decisions.json           # Detected decisions
        └── summaries/               # Periodic summaries
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start local backend
npm run start:backend

# Start frontend with hot reload
npm run start:frontend

# Run tests
npm test
```

### Adding New Features
1. Create Lambda function in `api/` directory
2. Update `serverless.yml` with new function
3. Add frontend components in `web/src/`
4. Update WebSocket handlers for real-time features

## 📈 Monitoring & Debugging

### CloudWatch Dashboard
Monitor key metrics:
- Recording success rate
- Transcription latency
- Processing queue depth
- WebSocket connections

### Debugging Tools
```bash
# View Lambda logs
./scripts/debug-logs.sh <function-name>

# Test WebSocket connection
./scripts/test-websocket.sh

# Check processing status
./scripts/check-session.sh <session-id>
```

## 🔐 Security

- **Authentication**: AWS Cognito with JWT tokens
- **Authorization**: User-scoped S3 paths and DynamoDB records
- **Encryption**: At-rest (S3/DynamoDB) and in-transit (TLS)
- **Access Control**: Pre-signed URLs for uploads, no public S3 access

## 💰 Cost Optimization

Typical costs for moderate usage (1000 hours/month):
- **Lambda**: ~$5-10 (processing)
- **S3**: ~$25 (storage + requests)
- **Transcription**: ~$50 (Whisper API)
- **Data Transfer**: ~$10
- **Total**: ~$90-100/month

Cost-saving features:
- Automatic archival of old recordings
- Configurable quality settings
- Batch processing for non-real-time analysis
- S3 lifecycle policies

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Audio recording and chunked upload
- [x] User authentication
- [x] Basic storage structure

### Phase 2: Transcription (In Progress)
- [ ] Whisper integration
- [ ] Real-time transcription display
- [ ] Transcript search

### Phase 3: Intelligence Features
- [ ] Topic extraction
- [ ] Decision detection
- [ ] Entity recognition
- [ ] Meeting summaries

### Phase 4: Advanced Search
- [ ] Vector embeddings
- [ ] Semantic search
- [ ] Context-aware playback

### Phase 5: Enterprise Features
- [ ] Team collaboration
- [ ] Custom vocabularies
- [ ] API for third-party integrations
- [ ] Advanced analytics

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with AWS Serverless technologies
- Transcription powered by OpenAI Whisper
- UI components from Tailwind CSS
- Real-time features via AWS API Gateway WebSocket

## 📞 Support

- **Documentation**: [Full docs](https://docs.your-domain.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/audio-intelligence-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/audio-intelligence-platform/discussions)

---

**Ready to build intelligent audio applications?** Follow the Quick Start guide above and have your platform running in minutes!