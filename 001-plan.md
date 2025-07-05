# Real-Time Audio Intelligence Platform - Storage Structure Plan

## Current Structure Analysis

**Current S3 Structure:**
```
users/{userId}/audio/sessions/{date}-{sessionId}/
├── chunk-001.webm
├── chunk-002.webm
├── ...
└── metadata.json
```

**Issues with Current Structure:**
1. **No transcript storage** - No dedicated place for transcription output
2. **No real-time processing structure** - No way to track processing states
3. **No timestamp indexing** - Can't easily find content by time
4. **No analysis storage** - No space for topic extraction, summaries, etc.
5. **Limited session organization** - Date prefix makes organization awkward

## Proposed Improved Structure

### **Enhanced Session-Based Organization**

```
users/{userId}/audio/sessions/{sessionId}/
├── session.json                      # Session metadata & status
├── chunks/                           # Audio chunks organized by time
│   ├── 00000-00005.webm             # 0-5 seconds
│   ├── 00005-00010.webm             # 5-10 seconds
│   ├── 00010-00015.webm             # 10-15 seconds
│   └── ...
├── transcripts/                      # Transcription outputs
│   ├── 00000-00005.json             # Per-chunk transcripts
│   ├── 00005-00010.json             
│   ├── rolling.json                 # Real-time rolling transcript
│   └── final.json                   # Complete session transcript
├── analysis/                        # Real-time analysis outputs
│   ├── timeline.json                # Topic/content timeline
│   ├── speakers.json                # Speaker identification
│   ├── entities.json                # Named entities extracted
│   ├── decisions.json               # Decision points detected
│   └── summaries/                   # Periodic summaries
│       ├── 00000-00060.json         # 0-1 minute summary
│       ├── 00060-00120.json         # 1-2 minute summary
│       └── ...
├── processing/                      # Processing state tracking
│   ├── transcription-queue.json     # Pending transcription chunks
│   ├── analysis-queue.json          # Pending analysis chunks
│   └── status.json                  # Real-time processing status
└── exports/                         # Generated outputs
    ├── transcript.txt               # Plain text transcript
    ├── transcript.srt               # SRT subtitle file
    ├── summary.md                   # Session summary
    └── report.json                  # Complete analysis report
```

### **Session Metadata Structure (session.json)**

```json
{
  "sessionId": "meeting-2024-01-15-1430",
  "userId": "user-12345",
  "userEmail": "user@example.com",
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T15:45:00Z",
  "status": "active|completed|processing|failed",
  
  "audio": {
    "duration": 4500,
    "chunkCount": 90,
    "chunkDuration": 5,
    "sampleRate": 44100,
    "format": "webm"
  },
  "transcription": {
    "status": "in_progress|completed|failed",
    "provider": "whisper",
    "model": "whisper-1",
    "language": "en",
    "confidence": 0.95,
    "processedChunks": 75,
    "totalChunks": 90,
    "lastProcessedAt": "2024-01-15T15:42:00Z"
  },
  "analysis": {
    "status": "in_progress|completed|failed",
    "topicsDetected": ["budget", "Q4 planning", "team restructure"],
    "speakerCount": 3,
    "decisionsCount": 5,
    "actionItemsCount": 8,
    "lastAnalyzedAt": "2024-01-15T15:42:00Z"
  },
  "processing": {
    "transcriptionQueue": 15,
    "analysisQueue": 12,
    "errorCount": 0,
    "lastHeartbeat": "2024-01-15T15:44:30Z"
  },
  "metadata": {
    "title": "Weekly Team Meeting",
    "description": "Discussion of Q4 planning and budget allocation",
    "tags": ["meeting", "planning", "budget"],
    "participants": ["John", "Sarah", "Mike"],
    "location": "Conference Room A",
    "previousSession": "meeting-2024-01-08-1430",
    "nextSession": null
  }
}
```

### **Real-Time Processing Pipeline Design**

```
Audio Chunk Upload → Transcription Queue → Analysis Queue → UI Updates
        ↓                    ↓                    ↓              ↓
   S3 Storage         Whisper API        NLP Processing   WebSocket
        ↓                    ↓                    ↓              ↓
Status Updates    Transcript Storage   Analysis Storage   Dashboard
```

### **Processing State Tracking (processing/status.json)**

```json
{
  "sessionId": "meeting-2024-01-15-1430",
  "timestamp": "2024-01-15T15:44:30Z",
  "audio": {
    "chunksUploaded": 90,
    "chunksExpected": 90,
    "uploadComplete": true,
    "lastChunkAt": "2024-01-15T15:43:00Z"
  },
  "transcription": {
    "chunksQueued": 15,
    "chunksProcessing": 3,
    "chunksCompleted": 72,
    "chunksFailed": 0,
    "estimatedCompletion": "2024-01-15T15:47:00Z"
  },
  "analysis": {
    "chunksQueued": 12,
    "chunksProcessing": 2,
    "chunksCompleted": 76,
    "chunksFailed": 0,
    "estimatedCompletion": "2024-01-15T15:48:00Z"
  },
  "realtime": {
    "connectedClients": 3,
    "lastBroadcast": "2024-01-15T15:44:25Z",
    "queueDepth": 5
  }
}
```

### **Rolling Transcript Structure (transcripts/rolling.json)**

```json
{
  "sessionId": "meeting-2024-01-15-1430",
  "lastUpdated": "2024-01-15T15:44:30Z",
  "totalDuration": 4500,
  "segments": [
    {
      "start": 0,
      "end": 5,
      "text": "Good morning everyone, let's start with the budget review.",
      "speaker": "John",
      "confidence": 0.98,
      "chunkId": "00000-00005",
      "timestamp": "2024-01-15T15:44:25Z"
    },
    {
      "start": 5,
      "end": 10,
      "text": "The Q4 numbers are looking better than expected.",
      "speaker": "Sarah",
      "confidence": 0.96,
      "chunkId": "00005-00010",
      "timestamp": "2024-01-15T15:44:28Z"
    }
  ],
  "stats": {
    "totalWords": 1247,
    "avgConfidence": 0.94,
    "speakerChanges": 23,
    "processingLatency": 8.5
  }
}
```

## Benefits of This Structure

1. **Real-time Processing**: Clear queues and status tracking
2. **Time-based Access**: Direct timestamp-to-content mapping
3. **Parallel Processing**: Transcription and analysis can run independently
4. **Scalable Storage**: Organized for easy search and retrieval
5. **Export Ready**: Multiple output formats readily available
6. **WebSocket Integration**: Real-time status updates to UI
7. **Resumable Processing**: Track exactly what's been processed
8. **Analytics Ready**: Structured data for insights and search

## Implementation Strategy

### Phase 1: Storage Structure Migration
- Update `api/audio.js` to use new folder structure
- Modify chunk naming to timestamp-based format
- Update session metadata to new `session.json` structure
- Create helper functions for path generation

### Phase 2: Processing Infrastructure
- Create `api/transcription.js` with Whisper integration
- Implement processing queues and status tracking
- Add real-time status updates to storage
- Create processing state management

### Phase 3: Real-time Features
- Implement WebSocket infrastructure
- Add rolling transcript generation
- Create real-time dashboard updates
- Implement live analysis pipeline

### Phase 4: Analysis & Intelligence
- Add topic extraction and entity recognition
- Implement decision detection
- Create periodic summary generation
- Add semantic search capabilities

This structure supports the full real-time intelligence pipeline while maintaining the existing user isolation and security model.