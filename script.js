/**
 * Sleep Insight AI - 프론트엔드 로직
 * 주요 기능: 입력값 검증, API 요청, 결과 모달 출력
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 필요한 DOM 요소들 가져오기
    const sleepInput = document.getElementById('sleep-input');
    const currentChar = document.getElementById('current-char');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnSpinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');

    // 모달 관련 요소
    const resultModal = document.getElementById('result-modal');
    const resultBadge = document.getElementById('result-badge');
    const confidenceText = document.getElementById('confidence-text');
    const confidenceFill = document.getElementById('confidence-fill');
    const analysisReason = document.getElementById('analysis-reason');
    const closeModalBtn = document.getElementById('close-modal-btn');

    /**
     * [기능 1] 실시간 글자 수 체크
     * 사용자가 입력할 때마다 글자 수를 세어 화면에 표시합니다.
     */
    sleepInput.addEventListener('input', () => {
        const length = sleepInput.value.length;
        currentChar.textContent = length;

        // 글자 수에 따라 색상 변경 (예: 너무 적으면 붉은색)
        if (length < 10) {
            currentChar.style.color = '#EF4444';
        } else {
            currentChar.style.color = '#64748B';
        }
    });

    /**
     * [기능 2] 분석 버튼 클릭 이벤트
     * 버튼을 누르면 서버에 데이터를 보내고 결과를 기다립니다.
     */
    analyzeBtn.addEventListener('click', async () => {
        const text = sleepInput.value.trim();

        // 유효성 검사: 10자 이상 입력했는지 확인
        if (text.length < 10) {
            alert('수면 기록을 최소 10자 이상 입력해 주세요!');
            return;
        }

        // 로딩 상태 시작 (버튼 비활성화, 스피너 표시)
        setLoading(true);

        try {
            // 서버에 분석 요청 (백엔드 API 호출)
            const response = await fetch('/api/analyze-sleep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            const result = await response.json();

            if (result.success) {
                // 성공적으로 분석 결과를 받으면 모달에 데이터 채우기
                showResult(result.data);
            } else {
                alert('분석 중 오류가 발생했습니다: ' + result.message);
            }
        } catch (error) {
            console.error('API Error:', error);
            alert('서버와 통신하는 중 문제가 발생했습니다.');
        } finally {
            // 로딩 상태 해제
            setLoading(false);
        }
    });

    /**
     * [기능 3] 로딩 상태 제어 함수
     */
    function setLoading(isLoading) {
        if (isLoading) {
            analyzeBtn.disabled = true;
            btnSpinner.classList.remove('hidden');
            btnText.textContent = 'AI 분석 중...';
        } else {
            analyzeBtn.disabled = false;
            btnSpinner.classList.add('hidden');
            btnText.textContent = 'AI 수면 분석 시작';
        }
    }

    /**
     * [기능 4] 분석 결과 모달 출력 함수
     * @param {Object} data - { result: "긍정", confidence: 85, reason: "..." }
     */
    function showResult(data) {
        // 1. 뱃지 스타일 및 텍스트 설정
        resultBadge.textContent = data.result;
        resultBadge.className = 'result-badge'; // 클래스 초기화
        
        if (data.result === '긍정') {
            resultBadge.classList.add('badge-positive');
        } else if (data.result === '부정') {
            resultBadge.classList.add('badge-negative');
        } else {
            resultBadge.classList.add('badge-neutral');
        }

        // 2. 신뢰도 게이지 애니메이션
        confidenceText.textContent = data.confidence;
        confidenceFill.style.width = '0%'; // 애니메이션을 위해 먼저 0으로 설정
        
        setTimeout(() => {
            confidenceFill.style.width = data.confidence + '%';
        }, 100);

        // 3. 분석 이유 텍스트 설정
        analysisReason.textContent = data.reason;

        // 4. 모달 표시
        resultModal.classList.remove('hidden');
    }

    /**
     * [기능 5] 모달 닫기 버튼
     */
    closeModalBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // 오버레이 클릭 시에도 모달 닫기
    document.querySelector('.modal-overlay').addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });
});
