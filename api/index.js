/**
 * Sleep Insight AI - 서버리스 함수 (api/index.js)
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// 1. 설정 및 환경변수 불러오기
dotenv.config();
const app = express();

// 2. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 3. 외부 서비스 초기화 및 보안 체크
const isEnvSet = process.env.OPENAI_API_KEY && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

let openai = null;
let supabase = null;

if (isEnvSet) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

/**
 * [API] 수면 분석 요청 처리
 * POST /api/analyze-sleep
 */
app.post('/api/analyze-sleep', async (req, res) => {
    try {
        const { text } = req.body;

        if (!isEnvSet) {
            return res.status(500).json({ 
                success: false, 
                message: '서버 설정(API Key)이 완료되지 않았습니다. Vercel 대시보드(Settings > Environment Variables)에서 설정을 완료해 주세요.' 
            });
        }

        if (!text) {
            return res.status(400).json({ success: false, message: '텍스트가 없습니다.' });
        }

        // --- OpenAI 분석 ---
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `당신은 전문 수면 분석가입니다. 사용자의 수면 기록을 분석하여 결과를 JSON 형식으로만 답변하세요.
                    형식: { "result": "긍정" | "부정" | "중립", "confidence": 0~100 숫자, "reason": "한글 분석 내용" }`
                },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        // --- Supabase 저장 ---
        const { error } = await supabase
            .from('sleep_analysis_logs')
            .insert([{
                input_text: text,
                result: analysis.result,
                confidence: analysis.confidence,
                reason: analysis.reason
            }]);

        if (error) console.error('DB 저장 실패:', error);

        res.json({ success: true, data: analysis });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// Vercel용 내보내기
module.exports = app;
