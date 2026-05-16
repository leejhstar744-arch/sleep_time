-- 001_create_sleep_analysis_logs_table.sql
-- Sleep Insight AI 분석 로그 저장용 테이블 생성 쿼리

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS sleep_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 고유 아이디 (자동 생성)
    input_text TEXT NOT NULL,                      -- 사용자가 입력한 수면 기록
    result VARCHAR(20) NOT NULL,                   -- AI 분석 결과 (긍정/부정/중립)
    confidence INTEGER NOT NULL,                   -- 분석 신뢰도 (0~100)
    reason TEXT NOT NULL,                          -- 분석 근거/이유
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 생성 일시 (자동 기록)
);

-- 2. 보안 정책 설정 (RLS)
-- 연습용 프로젝트이므로 누구나 데이터를 넣을 수 있도록 설정합니다.
ALTER TABLE sleep_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs" 
ON sleep_analysis_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view logs" 
ON sleep_analysis_logs FOR SELECT 
USING (true);

-- 주석 추가
COMMENT ON TABLE sleep_analysis_logs IS '사용자의 수면 데이터 AI 분석 로그를 저장하는 테이블입니다.';
