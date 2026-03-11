// 로또 번호 생성 함수
function generateLottoNumbers() {
    const numbers = [];
    
    // 1부터 45까지의 숫자 중에서 6개 선택
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    // 오름차순 정렬
    numbers.sort((a, b) => a - b);
    
    // 보너스 번호 생성 (메인 번호와 중복되지 않도록)
    let bonusNumber;
    do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
    } while (numbers.includes(bonusNumber));
    
    return { numbers, bonusNumber };
}

// 번호에 따른 색상 클래스 결정
function getNumberClass(number) {
    if (number <= 10) return 'low';
    if (number <= 20) return 'mid';
    return 'high';
}

// 번호를 화면에 표시
function displayNumbers(numbers, bonusNumber) {
    const numbersContainer = document.getElementById('numbers');
    const bonusContainer = document.getElementById('bonusContainer');
    const bonusNumberElement = document.getElementById('bonusNumber');
    
    // 기존 번호 제거
    numbersContainer.innerHTML = '';
    
    // 메인 번호 표시
    numbers.forEach((num, index) => {
        setTimeout(() => {
            const ball = document.createElement('div');
            ball.className = `number-ball ${getNumberClass(num)}`;
            ball.textContent = num;
            numbersContainer.appendChild(ball);
        }, index * 100);
    });
    
    // 보너스 번호 표시
    setTimeout(() => {
        bonusContainer.style.display = 'block';
        bonusNumberElement.innerHTML = '';
        const bonusBall = document.createElement('div');
        bonusBall.className = `number-ball ${getNumberClass(bonusNumber)}`;
        bonusBall.textContent = bonusNumber;
        bonusNumberElement.appendChild(bonusBall);
    }, 700);
}

// Supabase에 로또 번호 저장
async function saveToSupabase(numbers, bonusNumber) {
    try {
        console.log('💾 Supabase 저장 시도...', { numbers, bonusNumber });
        
        // Supabase 클라이언트가 초기화되었는지 확인
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase가 아직 초기화되지 않았습니다. 잠시 후 다시 시도합니다...');
            
            // 1초 후 다시 시도
            setTimeout(async () => {
                if (window.supabaseClient) {
                    await saveToSupabase(numbers, bonusNumber);
                } else {
                    console.error('❌ Supabase 초기화 실패. Vercel 환경변수를 확인하세요.');
                    alert('데이터베이스 연결에 실패했습니다. 브라우저 콘솔을 확인하세요.');
                }
            }, 1000);
            return;
        }

        console.log('📤 데이터베이스에 저장 중...');
        const { data, error } = await window.supabaseClient
            .from('lotto_numbers')
            .insert([
                {
                    numbers: numbers,
                    bonus_number: bonusNumber
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase 저장 오류:', error);
            console.error('오류 상세:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert('저장 중 오류가 발생했습니다: ' + error.message);
        } else {
            console.log('✅ Supabase에 저장 완료:', data);
            // 저장 성공 시 시각적 피드백 (선택사항)
            // alert('번호가 데이터베이스에 저장되었습니다!');
        }
    } catch (err) {
        console.error('❌ 저장 중 예외 발생:', err);
        console.error('예외 상세:', err.stack);
        alert('저장 중 예상치 못한 오류가 발생했습니다: ' + err.message);
    }
}

// 히스토리에 추가
function addToHistory(numbers, bonusNumber) {
    const history = document.getElementById('history');
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const numbersDiv = document.createElement('div');
    numbersDiv.className = 'history-numbers';
    
    numbers.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `history-number ${getNumberClass(num)}`;
        ball.textContent = num;
        numbersDiv.appendChild(ball);
    });
    
    const bonusDiv = document.createElement('div');
    bonusDiv.className = 'history-bonus';
    bonusDiv.textContent = `+ ${bonusNumber}`;
    
    historyItem.appendChild(numbersDiv);
    historyItem.appendChild(bonusDiv);
    
    // 맨 위에 추가
    history.insertBefore(historyItem, history.firstChild);
    
    // 최대 10개까지만 유지
    while (history.children.length > 10) {
        history.removeChild(history.lastChild);
    }
}

// 초기화 함수
function clearAll() {
    document.getElementById('numbers').innerHTML = '';
    document.getElementById('bonusContainer').style.display = 'none';
    document.getElementById('history').innerHTML = '<div class="empty-state">아직 생성된 번호가 없습니다.</div>';
}

// 이전 3개월 로또 1등 당첨 번호 데이터 (참고용 샘플 데이터 - 주 1회씩 12주)
const previousWinningNumbers = [
    { date: '2025.12.07', numbers: [7, 12, 18, 23, 31, 42], bonus: 15 },
    { date: '2025.12.14', numbers: [3, 9, 16, 25, 33, 40], bonus: 11 },
    { date: '2025.12.21', numbers: [5, 14, 21, 28, 35, 44], bonus: 19 },
    { date: '2025.12.28', numbers: [2, 11, 17, 26, 32, 41], bonus: 8 },
    { date: '2026.01.04', numbers: [4, 13, 19, 27, 34, 43], bonus: 6 },
    { date: '2026.01.11', numbers: [1, 10, 20, 29, 36, 45], bonus: 14 },
    { date: '2026.01.18', numbers: [6, 15, 22, 30, 37, 38], bonus: 9 },
    { date: '2026.01.25', numbers: [8, 16, 24, 31, 39, 42], bonus: 12 },
    { date: '2026.02.01', numbers: [3, 11, 18, 25, 33, 40], bonus: 7 },
    { date: '2026.02.08', numbers: [5, 14, 21, 28, 35, 44], bonus: 13 },
    { date: '2026.02.15', numbers: [2, 9, 17, 26, 32, 41], bonus: 10 },
    { date: '2026.02.22', numbers: [4, 12, 19, 27, 34, 43], bonus: 16 }
];

// 참고 데이터 표시 함수 (한 줄로 표시)
function displayReferenceData() {
    const referenceContainer = document.getElementById('referenceData');
    referenceContainer.innerHTML = '';
    
    previousWinningNumbers.forEach((item, index) => {
        const referenceItem = document.createElement('div');
        referenceItem.className = 'reference-item';
        
        const dateLabel = document.createElement('div');
        dateLabel.className = 'reference-date';
        dateLabel.textContent = item.date;
        
        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'reference-numbers';
        
        item.numbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `reference-number ${getNumberClass(num)}`;
            ball.textContent = num;
            numbersDiv.appendChild(ball);
        });
        
        const bonusDiv = document.createElement('div');
        bonusDiv.className = 'reference-bonus';
        const bonusBall = document.createElement('div');
        bonusBall.className = `reference-number ${getNumberClass(item.bonus)}`;
        bonusBall.textContent = item.bonus;
        bonusDiv.appendChild(bonusBall);
        
        referenceItem.appendChild(dateLabel);
        referenceItem.appendChild(numbersDiv);
        referenceItem.appendChild(bonusDiv);
        
        referenceContainer.appendChild(referenceItem);
    });
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // 초기 상태 설정
    clearAll();
    displayReferenceData();
    
    // 번호 생성 버튼
    generateBtn.addEventListener('click', async () => {
        const { numbers, bonusNumber } = generateLottoNumbers();
        displayNumbers(numbers, bonusNumber);
        addToHistory(numbers, bonusNumber);
        // Supabase에 저장
        await saveToSupabase(numbers, bonusNumber);
    });
    
    // 초기화 버튼
    clearBtn.addEventListener('click', () => {
        if (confirm('모든 기록을 삭제하시겠습니까?')) {
            clearAll();
        }
    });
    
    // 키보드 단축키 (스페이스바로 생성)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            generateBtn.click();
        }
    });
});
