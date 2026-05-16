# API 명세서

# POST /api/analyze-sleep

## Request
```json
{
  "text": "최근 수면 시간이 불규칙해요."
}
```

---

## Response
```json
{
  "success": true,
  "data": {
    "result": "부정",
    "confidence": 91,
    "reason": "수면 패턴이 불규칙합니다."
  }
}
```

---

# GET /api/history

## Response
```json
{
  "success": true,
  "data": []
}
```
