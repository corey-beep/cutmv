# Cloudflare Queues Integration for CUTMV

## Overview

CUTMV now supports Cloudflare Queues for scalable, serverless video processing. This integration provides:

- **Built-in retry/durability** - Failed jobs automatically retry with exponential backoff
- **Tight R2 integration** - No egress fees, seamless file handling
- **Serverless architecture** - No infrastructure to maintain
- **Cost-effective** - Pay per operation, cheaper than Temporal at scale
- **Horizontal scaling** - Automatically scales with demand

## Architecture

### Current Flow (with Queue Integration)

1. **User uploads video** → Stored in Cloudflare R2 immediately
2. **User initiates processing** → Job enqueued to Cloudflare Queue
3. **Cloudflare Worker processes** → Downloads from R2, runs FFmpeg, uploads results
4. **Progress updates** → Worker sends progress via webhook to main server
5. **WebSocket broadcasting** → Real-time progress sent to frontend

### Fallback Flow

If Cloudflare Queues are not configured:
- System automatically falls back to direct processing
- All existing functionality continues to work
- No disruption to user experience

## Environment Variables

Add these to your Replit environment:

```bash
# Cloudflare Queue Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_QUEUE_NAME=cutmv-processing

# Optional: Webhook URL for progress updates
WEBHOOK_URL=https://cutmv.fulldigitalll.com
```

## Cloudflare Worker Deployment

### 1. Create the Queue

```bash
npx wrangler queues create cutmv-processing
```

### 2. Deploy Worker

Create `wrangler.toml`:

```toml
name = "cutmv-processor"
main = "./server/cloudflare-worker.ts"
compatibility_date = "2023-11-21"

[[queues.consumers]]
queue = "cutmv-processing"
max_batch_size = 1
max_batch_timeout = 30

[env.production.vars]
WEBHOOK_URL = "https://cutmv.fulldigitalll.com"

[[env.production.r2_buckets]]
binding = "CUTMV_STORAGE"
bucket_name = "cutmv-storage"
```

Deploy:

```bash
npx wrangler deploy
```

### 3. Configure R2 Bucket Binding

```bash
npx wrangler r2 bucket create cutmv-storage
```

## API Endpoints

### Queue Status Check

```
GET /api/queue-status
```

Response:
```json
{
  "healthy": true,
  "message": "Queue 'cutmv-processing' is operational",
  "configured": true
}
```

### Progress Webhook

```
POST /api/queue-progress
```

Receives progress updates from Cloudflare Worker and broadcasts to WebSocket clients.

## Testing

### 1. Check Queue Status

Visit `/api/queue-status` to verify Cloudflare Queues connectivity.

### 2. Process Test Video

Upload a video and start processing - system will:
1. Attempt to use Cloudflare Queues
2. Fall back to direct processing if queues unavailable
3. Log which method is being used

### 3. Monitor Logs

Queue processing logs appear with `🚀` and `✅` indicators:

```
🚀 Attempting to enqueue job cutmv_123_1234567890 to Cloudflare Queues...
✅ Job successfully enqueued to Cloudflare Queues: cutmv_123_1234567890
```

Fallback logs appear with `⚠️` and `🔄` indicators:

```
⚠️ Cloudflare Queues not available: Queue not configured
🔄 Falling back to direct processing...
```

## Benefits of Queue Integration

### Performance
- **Parallel Processing**: Multiple workers can process different jobs simultaneously
- **Resource Isolation**: Queue processing doesn't impact main server performance
- **Optimized FFmpeg**: Workers can use optimized FFmpeg builds

### Reliability
- **Automatic Retries**: Failed jobs retry up to 3 times with exponential backoff
- **Durability**: Jobs persist even if workers restart
- **Error Isolation**: Failed jobs don't crash main server

### Scalability
- **Horizontal Scaling**: Cloudflare automatically scales workers based on queue depth
- **Global Distribution**: Workers run close to users for faster processing
- **Cost Efficiency**: Pay only for actual processing time

### Developer Experience
- **Real-time Progress**: WebSocket updates work with both queue and direct processing
- **Seamless Fallback**: No code changes needed - system auto-detects queue availability
- **Rich Logging**: Comprehensive logs for debugging both queue and direct processing

## Monitoring

### Queue Metrics
- Monitor queue depth in Cloudflare Dashboard
- Track processing times and success rates
- Set up alerts for failed jobs

### Application Metrics
- WebSocket connection status indicates real-time capability
- Processing logs show queue vs direct processing usage
- Error logs capture both queue and fallback processing issues

## Migration Path

1. **Phase 1**: Deploy with fallback (current implementation)
2. **Phase 2**: Configure Cloudflare environment variables
3. **Phase 3**: Deploy Cloudflare Worker
4. **Phase 4**: Monitor and optimize queue processing
5. **Phase 5**: Eventually remove direct processing fallback (optional)

This gradual approach ensures zero downtime and allows testing queue processing alongside existing functionality.