// Supabase 초기화 완료를 기다리는 함수 (script.js 내부에 정의)
function waitForSupabase(timeout = 15000) {
    return new Promise((resolve, reject) => {
        console.log('🔍 Supabase 초기화 상태 확인:', {
            initialized: window.supabaseInitialized,
            hasClient: !!window.supabaseClient,
            hasPromise: !!window.supabaseInitPromise
        });
        
        // 이미 초기화되어 있으면 바로 반환
        if (window.supabaseInitialized && window.supabaseClient) {
            console.log('✅ Supabase가 이미 초기화되어 있습니다.');
            resolve(window.supabaseClient);
            return;
        }
        
        // 초기화 중이면 Promise를 기다림
        if (window.supabaseInitPromise) {
            console.log('⏳ 기존 초기화 Promise를 기다립니다...');
            window.supabaseInitPromise
                .then(() => {
                    if (window.supabaseClient) {
                        console.log('✅ 초기화 Promise 완료!');
                        resolve(window.supabaseClient);
                    } else {
                        reject(new Error('Supabase 초기화 실패: 클라이언트가 생성되지 않았습니다.'));
                    }
                })
                .catch((error) => {
                    console.error('❌ 초기화 Promise 실패:', error);
                    reject(error);
                });
            return;
        }
        
        // 초기화가 시작되지 않았으면 시작 시도
        console.warn('⚠️ Supabase 초기화가 시작되지 않았습니다. 수동으로 초기화를 시도합니다...');
        
        // supabase-config.js의 initSupabase 함수 호출 시도
        if (typeof initSupabase === 'function') {
            console.log('🔄 initSupabase 함수를 호출합니다...');
            initSupabase().then(() => {
                if (window.supabaseClient) {
                    resolve(window.supabaseClient);
                } else {
                    reject(new Error('초기화 후에도 클라이언트가 생성되지 않았습니다.'));
                }
            }).catch(reject);
            return;
        }
        
        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
            console.error('❌ 타임아웃 발생! 현재 상태:', {
                initialized: window.supabaseInitialized,
                hasClient: !!window.supabaseClient,
                hasPromise: !!window.supabaseInitPromise,
                hasInitFunction: typeof initSupabase === 'function'
            });
            reject(new Error(`Supabase 초기화 타임아웃 (${timeout/1000}초). 브라우저 콘솔을 확인하세요.`));
        }, timeout);
        
        // 초기화 완료를 기다림
        let checkCount = 0;
        const maxChecks = timeout / 100; // 100ms 간격으로 체크
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            if (window.supabaseInitialized && window.supabaseClient) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                console.log(`✅ 초기화 완료! (${checkCount * 100}ms 후)`);
                resolve(window.supabaseClient);
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                console.error('❌ 최대 체크 횟수 초과:', {
                    initialized: window.supabaseInitialized,
                    hasClient: !!window.supabaseClient
                });
                reject(new Error('Supabase 초기화 타임아웃'));
            } else if (checkCount % 10 === 0) {
                // 1초마다 상태 로그
                console.log(`⏳ 초기화 대기 중... (${checkCount * 100}ms)`, {
                    initialized: window.supabaseInitialized,
                    hasClient: !!window.supabaseClient
                });
            }
        }, 100);
    });
}

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
        
        // Supabase 초기화 완료를 기다림
        let client;
        try {
            console.log('⏳ Supabase 초기화 완료 대기 중...');
            client = await waitForSupabase(10000); // 10초 타임아웃
            console.log('✅ Supabase 초기화 완료! 저장을 진행합니다...');
        } catch (error) {
            console.error('❌ Supabase 초기화 실패:', error);
            console.error('💡 해결 방법:');
            console.error('   1. 브라우저 콘솔(F12)에서 오류 메시지 확인');
            console.error('   2. Vercel 대시보드 → Settings → Environment Variables 확인');
            console.error('   3. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 설정 확인');
            console.error('   4. 환경변수 설정 후 반드시 Redeploy 실행');
            alert('데이터베이스 연결에 실패했습니다.\n\n브라우저 콘솔(F12)을 열어 오류 메시지를 확인하세요.\n\nVercel 환경변수가 설정되어 있는지 확인해주세요.');
            return;
        }
        
        if (!client) {
            console.error('❌ Supabase 클라이언트를 가져올 수 없습니다.');
            return;
        }

        console.log('📤 데이터베이스에 저장 중...');
        const { data, error } = await client
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
