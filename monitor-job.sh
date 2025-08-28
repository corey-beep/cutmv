#!/bin/bash
# Monitor video processing job progress

echo "🔍 Monitoring job ID 37 for video 24..."

for i in {1..30}; do
  echo "--- Check $i at $(date) ---"
  
  # Check database status
  sqlite3 --header --line /tmp/status.db "SELECT id, video_id, status, progress, error_message FROM background_jobs WHERE id = 37;" 2>/dev/null || \
  curl -s -X GET "localhost:5432" &>/dev/null || echo "DB connection check"
  
  # Check for FFmpeg processes
  ps aux | grep ffmpeg | grep -v grep || echo "No FFmpeg processes running"
  
  # Check for processing files
  ls -la uploads/clips/ 2>/dev/null || echo "No clips directory"
  
  echo ""
  sleep 10
done