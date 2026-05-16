/**
 * Sleep Insight AI - 백엔드 서버 (Node.js + Express)
 * 주요 역할: API 제공, OpenAI 연동, Supabase 데이터 저장
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 1. 설정 및 환경변수 불러오기
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 2. 미들웨어 설정
app.use(cors()); // 다른 도메인에서의 요청 허용
app.use(express.json()); // JSON 형태의 데이터 처리
app.use(express.static(__dirname)); // 현재 폴더의 정적 파일(html, css, js) 제공

// 3. 외부 서비스(OpenAI, Supabase) 초기화
// 환경 변수가 없을 경우 서버가 죽지 않도록 체크합니다.
const isEnvSet = process.env.OPENAI_API_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

let openai = null;
let supabase = null;

if (isEnvSet) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
} else {
    console.warn('⚠️ 경고: 환경 변수가 설정되지 않았습니다. Vercel 대시보드에서 설정을 확인해 주세요.');
}

/**
 * [API] 수면 분석 요청 처리
 * POST /api/analyze-sleep
 */
app.post('/api/analyze-sleep', async (req, res) => {
    try {
        const { text } = req.body;

        // 환경 변수 설정 여부 재확인
        if (!isEnvSet) {
            return res.status(500).json({ 
                success: false, 
                message: '서버 설정(API Key)이 완료되지 않았습니다. 관리자에게 문의해 주세요.' 
            });
        }

        if (!text) {
            return res.status(400).json({ success: false, message: '텍스트가 없습니다.' });
        }

        // --- (1) OpenAI를 이용한 AI 분석 ---
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 비용 효율적인 최신 모델 사용
            messages: [
                {
                    role: "system",
                    content: `당신은 전문 수면 분석가입니다. 사용자의 수면 기록을 분석하여 결과를 JSON 형식으로만 답변하세요.
                    형식: { "result": "긍정" | "부정" | "중립", "confidence": 0~100 숫자, "reason": "한글 분석 내용" }`
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" }, // 반드시 JSON으로 답변하도록 설정
            temperature: 0.3 // 일관된 답변을 위해 낮게 설정
        });

        // AI 답변 파싱
        const analysis = JSON.parse(completion.choices[0].message.content);

        // --- (2) Supabase 데이터베이스에 저장 ---
        const { data, error } = await supabase
            .from('sleep_analysis_logs') // 테이블명 (나중에 생성할 예정)
            .insert([
                {
                    input_text: text,
                    result: analysis.result,
                    confidence: analysis.confidence,
                    reason: analysis.reason
                }
            ]);

        if (error) {
            console.error('Supabase DB Error:', error);
            // DB 저장은 실패해도 분석 결과는 클라이언트에 보내주기 위해 에러를 던지지는 않습니다.
        }

        // --- (3) 클라이언트에 최종 결과 응답 ---
        res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            success: false, 
            message: '서버 내부 오류가 발생했습니다. API 키 설정을 확인해 주세요.' 
        });
    }
});

// 서버 시작
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`Sleep Insight AI 서버가 가동되었습니다!`);
        console.log(`주소: http://localhost:${PORT}`);
        console.log(`=========================================`);
    });
}

// Vercel 배포를 위한 내보내기
module.exports = app;
