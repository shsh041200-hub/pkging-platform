#!/usr/bin/env bash
set -euo pipefail

# Pipeline checkpoint save/load helper for Paperclip issues.
# Uses the issue documents API (key: "checkpoint").
#
# Usage:
#   ./scripts/checkpoint.sh save <issue-id> <checkpoint-json-file>
#   ./scripts/checkpoint.sh load <issue-id>
#   ./scripts/checkpoint.sh clear <issue-id>
#   ./scripts/checkpoint.sh exists <issue-id>
#
# Requires: PAPERCLIP_API_URL, PAPERCLIP_API_KEY
# Optional: PAPERCLIP_RUN_ID (included in mutating requests)

CMD="${1:-}"
ISSUE_ID="${2:-}"

if [[ -z "$CMD" || -z "$ISSUE_ID" ]]; then
  echo "Usage: checkpoint.sh {save|load|clear|exists} <issue-id> [checkpoint-json-file]" >&2
  exit 1
fi

API_URL="${PAPERCLIP_API_URL:?PAPERCLIP_API_URL is required}"
API_KEY="${PAPERCLIP_API_KEY:?PAPERCLIP_API_KEY is required}"
RUN_ID="${PAPERCLIP_RUN_ID:-}"

auth_header="Authorization: Bearer ${API_KEY}"
run_header=""
if [[ -n "$RUN_ID" ]]; then
  run_header="X-Paperclip-Run-Id: ${RUN_ID}"
fi

doc_url="${API_URL}/api/issues/${ISSUE_ID}/documents/checkpoint"

case "$CMD" in
  save)
    JSON_FILE="${3:-}"
    if [[ -z "$JSON_FILE" ]]; then
      echo "Usage: checkpoint.sh save <issue-id> <checkpoint-json-file>" >&2
      exit 1
    fi
    if [[ ! -f "$JSON_FILE" ]]; then
      echo "Error: file not found: $JSON_FILE" >&2
      exit 1
    fi

    checkpoint_body=$(cat "$JSON_FILE")

    base_rev=""
    existing=$(python3 -c "
import json, urllib.request, sys
try:
    req = urllib.request.Request('${doc_url}', headers={'Authorization': 'Bearer ${API_KEY}'})
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    print(data.get('latestRevisionId', ''))
except:
    print('')
" 2>/dev/null)

    python3 -c "
import json, urllib.request, sys

body_content = json.loads(sys.stdin.read())
formatted = json.dumps(body_content, indent=2, ensure_ascii=False)

doc_body = '# Pipeline Checkpoint\n\n\`\`\`json\n' + formatted + '\n\`\`\`'

payload = {
    'title': 'Pipeline Checkpoint',
    'format': 'markdown',
    'body': doc_body,
    'baseRevisionId': '${existing}' if '${existing}' else None
}

data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
req = urllib.request.Request(
    '${doc_url}',
    data=data,
    method='PUT',
    headers={
        'Authorization': 'Bearer ${API_KEY}',
        'Content-Type': 'application/json',
        'X-Paperclip-Run-Id': '${RUN_ID}'
    }
)
resp = urllib.request.urlopen(req)
result = json.loads(resp.read().decode())
print(json.dumps({'ok': True, 'revision': result.get('latestRevisionId')}, ensure_ascii=False))
" < "$JSON_FILE"
    ;;

  load)
    python3 -c "
import json, urllib.request, sys, re
try:
    req = urllib.request.Request('${doc_url}', headers={'Authorization': 'Bearer ${API_KEY}'})
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    body = data.get('body', '')
    match = re.search(r'\`\`\`json\s*\n(.*?)\n\`\`\`', body, re.DOTALL)
    if match:
        print(match.group(1))
    else:
        print(body)
except urllib.error.HTTPError as e:
    if e.code == 404:
        print(json.dumps({'exists': False}))
    else:
        raise
"
    ;;

  exists)
    python3 -c "
import urllib.request, sys
try:
    req = urllib.request.Request('${doc_url}', headers={'Authorization': 'Bearer ${API_KEY}'})
    urllib.request.urlopen(req)
    print('true')
except urllib.error.HTTPError as e:
    if e.code == 404:
        print('false')
    else:
        raise
"
    ;;

  clear)
    python3 -c "
import json, urllib.request

req = urllib.request.Request('${doc_url}', headers={'Authorization': 'Bearer ${API_KEY}'})
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode())
rev = data.get('latestRevisionId', '')

payload = json.dumps({
    'title': 'Pipeline Checkpoint',
    'format': 'markdown',
    'body': '# Pipeline Checkpoint\n\n_Cleared_',
    'baseRevisionId': rev
}, ensure_ascii=False).encode('utf-8')

req = urllib.request.Request(
    '${doc_url}',
    data=payload,
    method='PUT',
    headers={
        'Authorization': 'Bearer ${API_KEY}',
        'Content-Type': 'application/json',
        'X-Paperclip-Run-Id': '${RUN_ID}'
    }
)
resp = urllib.request.urlopen(req)
print(json.dumps({'ok': True, 'cleared': True}))
"
    ;;

  *)
    echo "Unknown command: $CMD" >&2
    echo "Usage: checkpoint.sh {save|load|clear|exists} <issue-id> [checkpoint-json-file]" >&2
    exit 1
    ;;
esac
