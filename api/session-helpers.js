'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

/**
 * Helper functions for session management and path generation
 */

// Generate timestamp-based chunk filename
const formatChunkTimestamp = (chunkNumber, chunkDuration = 5) => {
  const startTime = (chunkNumber - 1) * chunkDuration;
  const endTime = chunkNumber * chunkDuration;
  return `${startTime.toString().padStart(5, '0')}-${endTime.toString().padStart(5, '0')}`;
};

// Generate S3 paths for session structure
const generateSessionPaths = (userId, sessionId) => {
  const sanitizedSessionId = sessionId.replace(/[^a-zA-Z0-9\-_]/g, '');
  const basePath = `users/${userId}/audio/sessions/${sanitizedSessionId}`;
  
  return {
    basePath,
    sessionFile: `${basePath}/session.json`,
    chunksPath: `${basePath}/chunks/`,
    transcriptsPath: `${basePath}/transcripts/`,
    analysisPath: `${basePath}/analysis/`,
    processingPath: `${basePath}/processing/`,
    exportsPath: `${basePath}/exports/`,
    
    // Specific file paths
    rollingTranscript: `${basePath}/transcripts/rolling.json`,
    finalTranscript: `${basePath}/transcripts/final.json`,
    timelineAnalysis: `${basePath}/analysis/timeline.json`,
    speakerAnalysis: `${basePath}/analysis/speakers.json`,
    processingStatus: `${basePath}/processing/status.json`,
    transcriptionQueue: `${basePath}/processing/transcription-queue.json`,
    analysisQueue: `${basePath}/processing/analysis-queue.json`
  };
};

// Generate chunk path
const generateChunkPath = (userId, sessionId, chunkNumber, chunkDuration = 5) => {
  const paths = generateSessionPaths(userId, sessionId);
  const timestamp = formatChunkTimestamp(chunkNumber, chunkDuration);
  return `${paths.chunksPath}${timestamp}.webm`;
};

// Generate transcript path for a chunk
const generateTranscriptPath = (userId, sessionId, chunkNumber, chunkDuration = 5) => {
  const paths = generateSessionPaths(userId, sessionId);
  const timestamp = formatChunkTimestamp(chunkNumber, chunkDuration);
  return `${paths.transcriptsPath}${timestamp}.json`;
};

// Create default session metadata structure
const createDefaultSessionMetadata = (sessionId, userId, userEmail, options = {}) => {
  return {
    sessionId,
    userId,
    userEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
    
    audio: {
      duration: 0,
      chunkCount: 0,
      chunkDuration: options.chunkDuration || 5,
      sampleRate: options.sampleRate || 44100,
      format: 'webm'
    },
    
    transcription: {
      status: 'pending',
      provider: 'whisper',
      model: 'whisper-1',
      language: options.language || 'en',
      confidence: 0,
      processedChunks: 0,
      totalChunks: 0,
      lastProcessedAt: null
    },
    
    analysis: {
      status: 'pending',
      topicsDetected: [],
      speakerCount: 0,
      decisionsCount: 0,
      actionItemsCount: 0,
      lastAnalyzedAt: null
    },
    
    processing: {
      transcriptionQueue: 0,
      analysisQueue: 0,
      errorCount: 0,
      lastHeartbeat: new Date().toISOString()
    },
    
    metadata: {
      title: options.title || '',
      description: options.description || '',
      tags: options.tags || [],
      participants: options.participants || [],
      location: options.location || '',
      previousSession: options.previousSession || null,
      nextSession: null
    }
  };
};

// Create default processing status
const createDefaultProcessingStatus = (sessionId) => {
  return {
    sessionId,
    timestamp: new Date().toISOString(),
    audio: {
      chunksUploaded: 0,
      chunksExpected: 0,
      uploadComplete: false,
      lastChunkAt: null
    },
    transcription: {
      chunksQueued: 0,
      chunksProcessing: 0,
      chunksCompleted: 0,
      chunksFailed: 0,
      estimatedCompletion: null
    },
    analysis: {
      chunksQueued: 0,
      chunksProcessing: 0,
      chunksCompleted: 0,
      chunksFailed: 0,
      estimatedCompletion: null
    },
    realtime: {
      connectedClients: 0,
      lastBroadcast: null,
      queueDepth: 0
    }
  };
};

// Update session metadata
const updateSessionMetadata = async (bucketName, userId, sessionId, updates) => {
  const paths = generateSessionPaths(userId, sessionId);
  
  try {
    // Get existing metadata
    const existingObj = await s3.getObject({
      Bucket: bucketName,
      Key: paths.sessionFile
    }).promise();
    
    const existingMetadata = JSON.parse(existingObj.Body.toString());
    
    // Merge updates
    const updatedMetadata = {
      ...existingMetadata,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated metadata
    await s3.putObject({
      Bucket: bucketName,
      Key: paths.sessionFile,
      Body: JSON.stringify(updatedMetadata, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    return updatedMetadata;
  } catch (error) {
    console.error('Error updating session metadata:', error);
    throw error;
  }
};

// Update processing status
const updateProcessingStatus = async (bucketName, userId, sessionId, updates) => {
  const paths = generateSessionPaths(userId, sessionId);
  
  try {
    let existingStatus;
    
    // Try to get existing status
    try {
      const existingObj = await s3.getObject({
        Bucket: bucketName,
        Key: paths.processingStatus
      }).promise();
      existingStatus = JSON.parse(existingObj.Body.toString());
    } catch (error) {
      // Create default if doesn't exist
      existingStatus = createDefaultProcessingStatus(sessionId);
    }
    
    // Merge updates
    const updatedStatus = {
      ...existingStatus,
      ...updates,
      timestamp: new Date().toISOString()
    };
    
    // Save updated status
    await s3.putObject({
      Bucket: bucketName,
      Key: paths.processingStatus,
      Body: JSON.stringify(updatedStatus, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    return updatedStatus;
  } catch (error) {
    console.error('Error updating processing status:', error);
    throw error;
  }
};

// Get session metadata (try both new and old formats)
const getSessionMetadata = async (bucketName, userId, sessionId) => {
  const paths = generateSessionPaths(userId, sessionId);
  
  try {
    // Try new format first
    const sessionObj = await s3.getObject({
      Bucket: bucketName,
      Key: paths.sessionFile
    }).promise();
    
    return JSON.parse(sessionObj.Body.toString());
  } catch (newErr) {
    // Fallback to old format
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const oldMetadataKey = `users/${userId}/audio/sessions/${timestamp}-${sessionId}/metadata.json`;
      
      const oldObj = await s3.getObject({
        Bucket: bucketName,
        Key: oldMetadataKey
      }).promise();
      
      return JSON.parse(oldObj.Body.toString());
    } catch (oldErr) {
      throw new Error(`Session metadata not found for ${sessionId}`);
    }
  }
};

// Initialize session folders and files
const initializeSessionStructure = async (bucketName, userId, sessionId, options = {}) => {
  const paths = generateSessionPaths(userId, sessionId);
  const sessionMetadata = createDefaultSessionMetadata(sessionId, userId, options.userEmail || 'unknown', options);
  const processingStatus = createDefaultProcessingStatus(sessionId);
  
  try {
    // Create session metadata
    await s3.putObject({
      Bucket: bucketName,
      Key: paths.sessionFile,
      Body: JSON.stringify(sessionMetadata, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    // Create processing status
    await s3.putObject({
      Bucket: bucketName,
      Key: paths.processingStatus,
      Body: JSON.stringify(processingStatus, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    // Create empty rolling transcript
    const emptyTranscript = {
      sessionId,
      lastUpdated: new Date().toISOString(),
      totalDuration: 0,
      segments: [],
      stats: {
        totalWords: 0,
        avgConfidence: 0,
        speakerChanges: 0,
        processingLatency: 0
      }
    };
    
    await s3.putObject({
      Bucket: bucketName,
      Key: paths.rollingTranscript,
      Body: JSON.stringify(emptyTranscript, null, 2),
      ContentType: 'application/json'
    }).promise();
    
    return { sessionMetadata, processingStatus };
  } catch (error) {
    console.error('Error initializing session structure:', error);
    throw error;
  }
};

module.exports = {
  formatChunkTimestamp,
  generateSessionPaths,
  generateChunkPath,
  generateTranscriptPath,
  createDefaultSessionMetadata,
  createDefaultProcessingStatus,
  updateSessionMetadata,
  updateProcessingStatus,
  getSessionMetadata,
  initializeSessionStructure
};