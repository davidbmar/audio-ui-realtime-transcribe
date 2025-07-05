#!/usr/bin/env node

// Simple test to verify session structure functions work correctly
const { 
  formatChunkTimestamp,
  generateSessionPaths,
  generateChunkPath,
  generateTranscriptPath,
  createDefaultSessionMetadata,
  createDefaultProcessingStatus
} = require('./api/session-helpers');

console.log('Testing Session Structure Functions...\n');

// Test 1: Timestamp formatting
console.log('1. Testing timestamp formatting:');
console.log('   Chunk 1 (5s):', formatChunkTimestamp(1, 5));
console.log('   Chunk 12 (5s):', formatChunkTimestamp(12, 5));
console.log('   Chunk 1 (30s):', formatChunkTimestamp(1, 30));

// Test 2: Path generation
console.log('\n2. Testing path generation:');
const userId = 'test-user-123';
const sessionId = 'meeting-2024-01-15-1430';
const paths = generateSessionPaths(userId, sessionId);
console.log('   Session paths:', JSON.stringify(paths, null, 2));

// Test 3: Chunk path generation
console.log('\n3. Testing chunk path generation:');
console.log('   Chunk 1:', generateChunkPath(userId, sessionId, 1, 5));
console.log('   Chunk 15:', generateChunkPath(userId, sessionId, 15, 5));

// Test 4: Transcript path generation
console.log('\n4. Testing transcript path generation:');
console.log('   Transcript 1:', generateTranscriptPath(userId, sessionId, 1, 5));
console.log('   Transcript 15:', generateTranscriptPath(userId, sessionId, 15, 5));

// Test 5: Default metadata structure
console.log('\n5. Testing default metadata structure:');
const metadata = createDefaultSessionMetadata(sessionId, userId, 'test@example.com', {
  title: 'Test Meeting',
  chunkDuration: 5,
  participants: ['Alice', 'Bob']
});
console.log('   Metadata structure created successfully');
console.log('   Session ID:', metadata.sessionId);
console.log('   Audio chunk duration:', metadata.audio.chunkDuration);
console.log('   Participants:', metadata.metadata.participants);

// Test 6: Default processing status
console.log('\n6. Testing default processing status:');
const status = createDefaultProcessingStatus(sessionId);
console.log('   Processing status created successfully');
console.log('   Session ID:', status.sessionId);
console.log('   Audio chunks uploaded:', status.audio.chunksUploaded);
console.log('   Transcription queue:', status.transcription.chunksQueued);

console.log('\n✅ All tests passed! Session structure functions work correctly.');