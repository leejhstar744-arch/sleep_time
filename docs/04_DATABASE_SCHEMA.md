# Database Schema

# 테이블명
sleep_analysis_logs

---

# 컬럼 구조

| 컬럼명 | 타입 |
|---|---|
| id | uuid |
| input_text | text |
| result | varchar |
| confidence | integer |
| reason | text |
| created_at | timestamp |

---

# SQL

```sql
CREATE TABLE sleep_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,
  result VARCHAR(20) NOT NULL,
  confidence INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```
