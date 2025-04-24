# Post-Authentication Updates

## WebSocket Gateway Reusability Analysis

The WebSocket gateway implemented for upload progress tracking is highly reusable. It provides a foundation for real-time communication that can be extended to various features in the application.

## Potential Use Cases (Low to High Complexity)

### 1. Notification System [Low Complexity] [Future]

- **Description**: Send real-time notifications to users (new messages, status updates, etc.)
- **Implementation**: Add notification events and handlers to the gateway
- **Benefits**: Improves user experience with instant feedback

### 2. Chat Status Indicators [Low Complexity] [Future]

- **Description**: Show online/offline status, typing indicators for chat functionality
- **Implementation**: Track user connections and broadcast status changes
- **Benefits**: Enhances social features with real-time presence information

### 3. Document Processing Status [Medium Complexity] [Current]

- **Description**: Track status of document processing (verification, OCR, etc.)
- **Implementation**: Similar to upload progress but for backend processing tasks
- **Benefits**: Keeps users informed during lengthy operations

### 4. Live Data Updates [Medium Complexity] [Future]

- **Description**: Push updates to dashboards, listings, or other data views
- **Implementation**: Broadcast data changes to subscribed clients
- **Benefits**: Eliminates polling and provides real-time data consistency

### 5. Collaborative Features [High Complexity] [Future]

- **Description**: Enable multiple users to work on the same resource simultaneously
- **Implementation**: Track changes, resolve conflicts, and broadcast updates
- **Benefits**: Supports collaborative workflows like document editing

### 6. Real-time Analytics [High Complexity] [Future]

- **Description**: Stream analytics data to admin dashboards
- **Implementation**: Process events and metrics, broadcast to admin interfaces
- **Benefits**: Provides immediate visibility into system performance

### 7. Appointment Scheduling [High Complexity] [Future]

- **Description**: Real-time availability updates for lawyer consultation scheduling
- **Implementation**: Track calendar changes and notify users of availability
- **Benefits**: Prevents double-booking and improves scheduling experience

## Implementation Considerations

To make the gateway more reusable:

1. Create a base WebSocket service that handles common functionality
2. Implement room-based subscriptions for topic-specific messaging
3. Add authentication and authorization to the WebSocket connections
4. Create standardized message formats for different event types
5. Implement reconnection and offline message queueing

The current implementation provides a solid foundation that can be extended to support these use cases with minimal changes to the core architecture.

# upload progress tracking implemenation:-

### 1. CloudinaryService Enhancement

```typescript
// Enhanced CloudinaryService with progress tracking
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'advonex',
    onProgress?: (progress: number) => void,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result)
            return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      // Convert buffer to stream and pipe to cloudinary
      const stream = Readable.from(file.buffer);

      // Track upload progress if callback provided
      if (onProgress) {
        let uploadedBytes = 0;
        const totalBytes = file.size;

        stream.on('data', (chunk) => {
          uploadedBytes += chunk.length;
          const progress = Math.round((uploadedBytes / totalBytes) * 100);
          onProgress(progress);
        });
      }

      stream.pipe(uploadStream);
    });
  }

  // ... other methods
}
```

### 2. WebSocket Gateway for Upload Progress

```typescript
// WebSocket gateway for tracking upload progress
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UploadProgressGateway {
  @WebSocketServer()
  server: Server;

  // Map to store upload sessions
  private uploadSessions = new Map<string, string>();

  @SubscribeMessage('startUpload')
  handleStartUpload(
    @MessageBody() data: { uploadId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { uploadId } = data;
    // Associate this client with the upload ID
    this.uploadSessions.set(uploadId, client.id);
    return { status: 'started', uploadId };
  }

  // Method to be called from the service to update progress
  updateProgress(uploadId: string, progress: number) {
    const clientId = this.uploadSessions.get(uploadId);
    if (clientId) {
      this.server.to(clientId).emit('uploadProgress', { uploadId, progress });
    }
  }

  @SubscribeMessage('endUpload')
  handleEndUpload(@MessageBody() data: { uploadId: string }) {
    const { uploadId } = data;
    // Clean up the session
    this.uploadSessions.delete(uploadId);
    return { status: 'ended', uploadId };
  }
}
```

### 3. Updated CloudinaryModule

```typescript
// Updated CloudinaryModule with WebSocket gateway
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryController } from './cloudinary.controller';
import { UploadProgressGateway } from './upload-progress.gateway';

@Module({
  providers: [CloudinaryProvider, CloudinaryService, UploadProgressGateway],
  controllers: [CloudinaryController],
  exports: [CloudinaryProvider, CloudinaryService, UploadProgressGateway],
})
export class CloudinaryModule {}
```

### 4. Enhanced CloudinaryController

```typescript
// Enhanced CloudinaryController with progress tracking
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { multerConfig } from './multer.config';
import { UploadImageResponseDto } from './dto/upload.dto';
import { UploadProgressGateway } from './upload-progress.gateway';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('uploads')
@Controller('api/uploads')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly uploadProgressGateway: UploadProgressGateway,
  ) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image to common storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        uploadId: {
          type: 'string',
          description: 'Optional ID to track upload progress via WebSockets',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadImageResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadId') uploadId?: string,
  ) {
    try {
      // Generate an upload ID if not provided
      const trackingId = uploadId || uuidv4();

      // Upload image to Cloudinary in the common uploads folder
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'advonex/common-uploads',
        (progress) => {
          // Update progress via WebSockets if uploadId was provided
          if (uploadId) {
            this.uploadProgressGateway.updateProgress(trackingId, progress);
          }
        },
      );

      // If uploadId was provided, send completion event
      if (uploadId) {
        this.uploadProgressGateway.updateProgress(trackingId, 100);
      }

      return {
        success: true,
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
          uploadId: trackingId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error uploading image');
    }
  }
}
```

### 5. Updated DTO for Upload Response

```typescript
// Updated DTO with uploadId field
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      imageUrl: { type: 'string' },
      publicId: { type: 'string' },
      uploadId: { type: 'string' },
    },
  })
  data: {
    imageUrl: string;
    publicId: string;
    uploadId?: string;
  };
}
```

### 6. Frontend Integration Example

```typescript
// Example frontend code for progress tracking
import { io } from 'socket.io-client';

// Connect to WebSocket server
const socket = io('http://localhost:3000');

// Function to upload file with progress tracking
async function uploadFileWithProgress(file) {
  // Generate a unique ID for this upload
  const uploadId = Date.now().toString();

  // Tell the server we're starting an upload
  socket.emit('startUpload', { uploadId });

  // Listen for progress updates
  socket.on('uploadProgress', (data) => {
    if (data.uploadId === uploadId) {
      // Update progress bar
      updateProgressBar(data.progress);
    }
  });

  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadId', uploadId);

  // Send the upload request
  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    body: formData,
  });

  // Clean up
  socket.emit('endUpload', { uploadId });

  return await response.json();
}

// Helper function to update UI
function updateProgressBar(progress) {
  const progressBar = document.getElementById('upload-progress');
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${progress}%`;
}
```

### 7. Required Dependencies

```bash
npm install @nestjs/websockets socket.io uuid
npm install --save-dev @types/uuid
```

```

```
