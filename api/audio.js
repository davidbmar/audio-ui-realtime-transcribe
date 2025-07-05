'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { 
  generateChunkPath, 
  generateSessionPaths, 
  updateSessionMetadata, 
  getSessionMetadata,
  initializeSessionStructure,
  createDefaultSessionMetadata 
} = require('./session-helpers');

// Generate pre-signed URL for audio chunk upload
module.exports.uploadChunk = async (event) => {
  try {
    // Get user claims from the authorizer
    const claims = event.requestContext?.authorizer?.claims || {};
    const email = claims.email || 'Anonymous';
    const userId = claims.sub || 'unknown';
    
    console.log(`User ${email} (${userId}) requesting audio chunk upload`);

    // Get bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable not set');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, chunkNumber, contentType, duration } = body;

    // Validate required fields
    if (!sessionId || chunkNumber === undefined) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'sessionId and chunkNumber are required' }),
      };
    }

    // Validate chunk number
    if (typeof chunkNumber !== 'number' || chunkNumber < 1) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'Invalid chunk number' }),
      };
    }

    // Sanitize session ID to prevent path traversal
    const sanitizedSessionId = sessionId.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (!sanitizedSessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'Invalid session ID' }),
      };
    }

    // Generate S3 key using helper function
    const s3Key = generateChunkPath(userId, sanitizedSessionId, chunkNumber, duration || 5);
    
    console.log(`Generating upload URL for chunk ${chunkNumber} of session ${sanitizedSessionId}`);

    // Generate pre-signed URL for upload
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 300, // 5 minutes
      ContentType: contentType || 'audio/webm'
    });

    console.log(`Generated upload URL for ${s3Key}`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Upload URL generated successfully',
        uploadUrl: uploadUrl,
        s3Key: s3Key,
        sessionId: sanitizedSessionId,
        chunkNumber: chunkNumber,
        expiresIn: 300,
        maxSizeBytes: 26214400,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error generating audio upload URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

// Create or update session metadata
module.exports.updateSessionMetadata = async (event) => {
  try {
    // Get user claims from the authorizer
    const claims = event.requestContext?.authorizer?.claims || {};
    const email = claims.email || 'Anonymous';
    const userId = claims.sub || 'unknown';
    
    console.log(`User ${email} (${userId}) updating session metadata`);

    // Get bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable not set');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { sessionId, metadata } = body;

    if (!sessionId || !metadata) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'sessionId and metadata are required' }),
      };
    }

    // Sanitize session ID
    const sanitizedSessionId = sessionId.replace(/[^a-zA-Z0-9\-_]/g, '');
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Get session paths
    const paths = generateSessionPaths(userId, sanitizedSessionId);
    
    // Try to get existing metadata, or create new
    let sessionMetadata;
    try {
      sessionMetadata = await getSessionMetadata(bucketName, userId, sanitizedSessionId);
      
      // Update existing metadata
      const updates = {
        audio: {
          ...sessionMetadata.audio,
          duration: metadata.duration || sessionMetadata.audio.duration,
          chunkCount: metadata.chunkCount || sessionMetadata.audio.chunkCount,
          chunkDuration: metadata.chunkDuration || sessionMetadata.audio.chunkDuration
        },
        metadata: {
          ...sessionMetadata.metadata,
          title: metadata.title || sessionMetadata.metadata.title,
          description: metadata.description || sessionMetadata.metadata.description,
          tags: metadata.tags || sessionMetadata.metadata.tags,
          participants: metadata.participants || sessionMetadata.metadata.participants,
          location: metadata.location || sessionMetadata.metadata.location,
          // Legacy fields
          summary: metadata.summary || sessionMetadata.metadata.summary,
          keywords: metadata.keywords || sessionMetadata.metadata.keywords,
          conversationContext: metadata.conversationContext || sessionMetadata.metadata.conversationContext
        }
      };
      
      sessionMetadata = await updateSessionMetadata(bucketName, userId, sanitizedSessionId, updates);
    } catch (error) {
      // Create new session if doesn't exist
      const sessionOptions = {
        userEmail: email,
        chunkDuration: metadata.chunkDuration || 5,
        title: metadata.title || '',
        description: metadata.description || '',
        tags: metadata.tags || [],
        participants: metadata.participants || [],
        location: metadata.location || '',
        summary: metadata.summary || '',
        keywords: metadata.keywords || [],
        conversationContext: metadata.conversationContext || ''
      };
      
      const result = await initializeSessionStructure(bucketName, userId, sanitizedSessionId, sessionOptions);
      sessionMetadata = result.sessionMetadata;
    }

    console.log(`Updated session metadata for session ${sanitizedSessionId}`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Session metadata updated successfully',
        sessionId: sanitizedSessionId,
        sessionKey: paths.sessionFile,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error updating session metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

// List audio sessions for a user
module.exports.listSessions = async (event) => {
  try {
    // Get user claims from the authorizer
    const claims = event.requestContext?.authorizer?.claims || {};
    const email = claims.email || 'Anonymous';
    const userId = claims.sub || 'unknown';
    
    console.log(`User ${email} (${userId}) listing audio sessions`);

    // Get bucket name from environment variable
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable not set');
    }

    // List all session folders for the user
    const prefix = `users/${userId}/audio/sessions/`;
    
    const s3Response = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/'
    }).promise();

    // Extract session folders from CommonPrefixes
    const sessions = [];
    if (s3Response.CommonPrefixes) {
      for (const prefixObj of s3Response.CommonPrefixes) {
        const sessionFolder = prefixObj.Prefix.split('/').slice(-2)[0]; // Get folder name
        
        // Try to load session metadata using helper function
        try {
          const sessionMetadata = await getSessionMetadata(bucketName, userId, sessionFolder);
          sessions.push({
            sessionId: sessionMetadata.sessionId,
            folder: sessionFolder,
            metadata: sessionMetadata
          });
        } catch (err) {
          // If no metadata, just include basic info
          sessions.push({
            sessionId: sessionFolder,
            folder: sessionFolder,
            metadata: null
          });
        }
      }
    }

    // Sort sessions by creation date (newest first)
    sessions.sort((a, b) => {
      const dateA = a.metadata?.createdAt || a.folder;
      const dateB = b.metadata?.createdAt || b.folder;
      return dateB.localeCompare(dateA);
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Sessions listed successfully',
        user: email,
        userId: userId,
        sessions: sessions,
        count: sessions.length,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error listing sessions:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

// Get failed chunks for a session (for batch retry)
module.exports.getFailedChunks = async (event) => {
  try {
    // Get user claims from the authorizer
    const claims = event.requestContext?.authorizer?.claims || {};
    const userId = claims.sub || 'unknown';
    
    // Get session ID from query parameters
    const sessionId = event.queryStringParameters?.sessionId;
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'sessionId is required' }),
      };
    }

    // This endpoint would typically check a database or DynamoDB table
    // For MVP, we'll return expected chunks vs actual chunks in S3
    
    const bucketName = process.env.S3_BUCKET_NAME;
    const sanitizedSessionId = sessionId.replace(/[^a-zA-Z0-9\-_]/g, '');
    const paths = generateSessionPaths(userId, sanitizedSessionId);
    
    // List existing chunks
    const s3Response = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: paths.chunksPath
    }).promise();
    
    const existingChunks = (s3Response.Contents || [])
      .filter(obj => obj.Key.includes('.webm'))
      .map(obj => {
        // Extract chunk number from timestamp format: 00000-00005.webm
        const match = obj.Key.match(/(\d{5})-(\d{5})\.webm$/);
        if (match) {
          const startTime = parseInt(match[1]);
          const chunkDuration = parseInt(match[2]) - startTime;
          return Math.floor(startTime / chunkDuration) + 1;
        }
        return null;
      })
      .filter(num => num !== null);
    
    // Get session metadata to know expected chunks
    try {
      const sessionData = await getSessionMetadata(bucketName, userId, sanitizedSessionId);
      const expectedChunks = sessionData.audio?.chunkCount || 0;
      
      // Find missing chunks
      const missingChunks = [];
      for (let i = 1; i <= expectedChunks; i++) {
        if (!existingChunks.includes(i)) {
          missingChunks.push(i);
        }
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          sessionId: sanitizedSessionId,
          expectedChunks: expectedChunks,
          uploadedChunks: existingChunks.sort((a, b) => a - b),
          missingChunks: missingChunks,
          timestamp: new Date().toISOString()
        }),
      };
    } catch (err) {
      // No metadata found
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          sessionId: sanitizedSessionId,
          uploadedChunks: existingChunks.sort((a, b) => a - b),
          missingChunks: [],
          error: 'No metadata found for session',
          timestamp: new Date().toISOString()
        }),
      };
    }
  } catch (error) {
    console.error('Error checking failed chunks:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};