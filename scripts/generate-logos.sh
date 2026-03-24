#!/bin/bash
# Generate logo images via xAI Grok Imagine API
# Usage: ./scripts/generate-logos.sh <prompts-json> <output-dir> [concurrency]
#
# prompts-json: JSON file with array of { "file": "name.jpg", "prompt": "..." }
# output-dir:   Directory to save images (created if missing)
# concurrency:  Max parallel requests (default: 10)
#
# Example:
#   ./scripts/generate-logos.sh scripts/logo-prompts.json public/assets/logos/my-batch 10

set -euo pipefail

PROMPTS_FILE="${1:?Usage: $0 <prompts.json> <output-dir> [concurrency]}"
OUTPUT_DIR="${2:?Usage: $0 <prompts.json> <output-dir> [concurrency]}"
CONCURRENCY="${3:-10}"

# Load API key
if [ -f .env.local ]; then
  XAI_API_KEY=$(grep '^XAI_API_KEY=' .env.local | cut -d'=' -f2-)
fi
if [ -z "${XAI_API_KEY:-}" ]; then
  echo "Error: XAI_API_KEY not found in .env.local"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

TOTAL=$(jq length "$PROMPTS_FILE")
echo "Generating $TOTAL images → $OUTPUT_DIR (concurrency: $CONCURRENCY)"
echo "---"

RUNNING=0
SUCCESS=0
FAIL=0

for i in $(seq 0 $((TOTAL - 1))); do
  FILE=$(jq -r ".[$i].file" "$PROMPTS_FILE")
  PROMPT=$(jq -r ".[$i].prompt" "$PROMPTS_FILE")
  NUM=$((i + 1))

  # Skip if already exists
  if [ -f "$OUTPUT_DIR/$FILE" ]; then
    echo "[$NUM/$TOTAL] SKIP $FILE (exists)"
    SUCCESS=$((SUCCESS + 1))
    continue
  fi

  (
    # Call xAI API
    RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/images/generations" \
      -H "Authorization: Bearer $XAI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$(jq -n --arg p "$PROMPT" '{
        model: "grok-imagine-image",
        prompt: $p,
        n: 1,
        response_format: "url"
      }')" 2>/dev/null)

    URL=$(echo "$RESPONSE" | jq -r '.data[0].url // empty' 2>/dev/null)

    if [ -n "$URL" ]; then
      curl -sL "$URL" -o "$OUTPUT_DIR/$FILE"
      SIZE=$(wc -c < "$OUTPUT_DIR/$FILE" | tr -d ' ')
      if [ "$SIZE" -gt 1000 ]; then
        echo "[$NUM/$TOTAL] OK $FILE (${SIZE}b)"
      else
        echo "[$NUM/$TOTAL] FAIL $FILE (too small: ${SIZE}b)"
        rm -f "$OUTPUT_DIR/$FILE"
      fi
    else
      ERROR=$(echo "$RESPONSE" | jq -r '.error // "unknown error"' 2>/dev/null)
      echo "[$NUM/$TOTAL] FAIL $FILE — $ERROR"
    fi
  ) &

  RUNNING=$((RUNNING + 1))
  if [ "$RUNNING" -ge "$CONCURRENCY" ]; then
    wait
    RUNNING=0
  fi
done

wait
echo "---"
DOWNLOADED=$(ls -1 "$OUTPUT_DIR"/*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "Done. $DOWNLOADED files in $OUTPUT_DIR"
