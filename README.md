# Real-Time Audio Intelligence Platform

A serverless platform for intelligent audio recording with real-time transcription, analysis, and semantic search capabilities. Built for meeting intelligence, conversation analysis, and AI memory applications.

## 🚀 Current Features (Phase 1 Complete)

### ✅ Implemented Core Capabilities
- **🎤 Smart Audio Recording**: Browser-based chunked recording with configurable durations (5s-5min)
- **📱 Mobile-Optimized UI**: Touch-friendly interface with iOS action sheets and responsive design
- **🎵 Audio Playback**: Direct .webm file playback with modal player interface
- **📁 Intelligent File Management**: Session-based organization with human-readable timestamps
- **🔄 FAB Navigation**: Floating action button for seamless navigation between pages
- **🏗️ Serverless Infrastructure**: AWS Lambda, S3, CloudFront, and Cognito integration
- **🔐 User Authentication**: Secure Cognito-based auth with user-isolated storage

### 🎯 Advanced UX Features
- **Human-Readable Sessions**: Displays `2025.07JUL.04-22:28:05` instead of cryptic timestamps
- **Smart Sorting**: Newest recording sessions appear first automatically
- **Mobile Action Sheets**: Native iOS-style action menus for file operations
- **Real-time File Operations**: Upload, download, rename, move, and delete with instant feedback
- **Progressive Audio Loading**: Chunked audio upload with resumable capabilities

### 🔮 Planned Features (Phase 2)
- **📝 Live Transcription**: Real-time Whisper-powered transcription with <10s latency
- **🧠 Intelligent Analysis**: Automatic topic extraction, decision detection, and entity recognition  
- **🔍 Semantic Search**: RAG-enabled search across active and historical recordings
- **⏯️ Context-Aware Playback**: Jump to relevant audio segments based on content

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
audio-ui-realtime-transcribe/
├── api/                    # Lambda functions
│   ├── audio.js           # Audio upload & session management ✅
│   ├── s3.js              # File operations (CRUD) ✅
│   ├── data.js            # API testing endpoint ✅
│   ├── memory.js          # Memory storage (future use) ✅
│   ├── session-helpers.js # Session utilities ✅
│   └── transcription.js   # Whisper integration (planned)
├── web/                   # Frontend application
│   ├── index.html         # File manager interface ✅
│   ├── audio.html.template # Audio recorder (React) ✅
│   ├── app.js.template    # Main application logic ✅
│   ├── styles.css         # Main UI styles ✅
│   ├── audio-ui-styles.css # Audio-specific styles ✅
│   └── callback.html      # OAuth callback handler ✅
├── step-*.sh              # Deployment scripts ✅
├── 001-plan.md           # Transcription implementation plan ✅
├── serverless.yml        # AWS resource definitions ✅
└── test-*.sh             # Testing utilities ✅
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
git clone https://github.com/davidbmar/audio-ui-realtime-transcribe.git
cd audio-ui-realtime-transcribe
```

2. **Run setup scripts in order**
```bash
chmod +x step-*.sh
./step-10-setup.sh              # Initial AWS configuration
./step-20-deploy-lambda.sh      # Deploy Lambda functions
./step-25-update-web-files.sh   # Deploy web files with env substitution
./step-30-deploy-memory.sh      # Deploy memory API (optional)
./step-45-validation.sh         # Validate deployment
./step-47-test-apis.sh          # Test API endpoints
```

3. **Access your platform**
```
File Manager: https://your-cloudfront-distribution.cloudfront.net
Audio Recorder: https://your-cloudfront-distribution.cloudfront.net/audio.html
```

### Current Deployment Status ✅
- ✅ **Core Infrastructure**: Lambda, S3, CloudFront, Cognito
- ✅ **Audio Recording**: Session-based chunked upload system
- ✅ **File Management**: Full CRUD operations with mobile UX
- ✅ **Authentication**: Cognito JWT with user isolation
- ✅ **Audio Playback**: Modal player for .webm files
- 🔄 **Transcription**: Planned for Phase 2

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

Session-based organization with timestamp indexing:
```
s3://your-bucket/
└── users/{userId}/audio/
    ├── sessions/
    │   ├── 202507JUL04-222805/     # Human-readable session names
    │   │   ├── session.json        # Session metadata ✅
    │   │   ├── chunks/
    │   │   │   ├── 00000-00005.webm # 0-5 seconds ✅
    │   │   │   ├── 00005-00010.webm # 5-10 seconds ✅
    │   │   │   └── ...
    │   │   ├── transcripts/         # Planned Phase 2
    │   │   │   ├── 00000-00005.json # Matching transcripts
    │   │   │   └── rolling.json     # Complete transcript
    │   │   └── analysis/            # Planned Phase 3
    │   │       ├── timeline.json    # Topic progression
    │   │       ├── decisions.json   # Detected decisions
    │   │       └── summaries/       # Periodic summaries
    │   └── 202507JUL04-223524/     # Another session
    └── files/                       # General file storage ✅
        ├── documents/
        ├── images/
        └── archives/
```

### Session Naming Convention ✅
- **Raw Format**: `202507JUL04-222805` (stored)
- **Display Format**: `2025.07JUL.04-22:28:05` (UI)
- **Auto-sorted**: Newest sessions first

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

## 🗺️ Roadmap & Progress

### ✅ Phase 1: Core Platform (COMPLETED - Dec 2024)
- [x] **Audio Recording**: Chunked upload system with 5s-5min configurable chunks
- [x] **User Authentication**: AWS Cognito with JWT tokens and user isolation  
- [x] **File Management**: Complete CRUD operations with mobile-optimized UI
- [x] **Session Organization**: Timestamp-based storage with human-readable names
- [x] **Audio Playback**: Modal player for .webm files with progress controls
- [x] **Mobile UX**: Touch-friendly interface with iOS action sheets
- [x] **FAB Navigation**: Seamless navigation between file manager and recorder
- [x] **Serverless Infrastructure**: AWS Lambda, S3, CloudFront deployment
- [x] **Smart Sorting**: Newest sessions first with intelligent file organization

### 🔄 Phase 2: Transcription (NEXT - Q1 2025)
- [ ] **Whisper Integration**: OpenAI Whisper API for audio transcription
- [ ] **Real-time Display**: Live transcription updates during recording
- [ ] **Transcript Storage**: JSON-based transcript storage structure
- [ ] **Search Functionality**: Basic text search across transcripts
- [ ] **Transcript Export**: Download transcripts in multiple formats

### 📋 Phase 3: Intelligence Features (Q2 2025)
- [ ] **Topic Extraction**: Automatic topic identification and tagging
- [ ] **Decision Detection**: AI-powered decision point identification
- [ ] **Entity Recognition**: People, places, organizations extraction
- [ ] **Meeting Summaries**: AI-generated session summaries
- [ ] **Timeline Analysis**: Visual progression of conversation topics

### 🔍 Phase 4: Advanced Search (Q3 2025)
- [ ] **Vector Embeddings**: Semantic understanding of audio content
- [ ] **RAG Integration**: Retrieval-augmented generation for queries
- [ ] **Context-Aware Playback**: Jump to relevant audio segments
- [ ] **Cross-Session Search**: Search across multiple recording sessions

### 🏢 Phase 5: Enterprise Features (Q4 2025)
- [ ] **Team Collaboration**: Shared sessions and permissions
- [ ] **Custom Vocabularies**: Domain-specific transcription accuracy
- [ ] **API Integration**: Third-party app integration capabilities
- [ ] **Advanced Analytics**: Usage patterns and insights dashboard

### 📈 Recent Accomplishments (January 2025)
- ✅ **Session Name Formatting**: Implemented human-readable timestamps
- ✅ **Audio Player Enhancement**: Fixed duration display and improved UX  
- ✅ **Mobile Action Sheets**: Added native iOS-style interaction patterns
- ✅ **Smart File Sorting**: Newest sessions automatically appear first
- ✅ **Bug Fixes**: Resolved audio player "Infinity:NaN" display issue
- ✅ **Code Organization**: Clean separation of concerns and helper functions

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