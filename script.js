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

// 이전 3개월 로또 1등 당첨 번호 데이터 (참고용 샘플 데이터)
const previousWinningNumbers = [
    { date: '2025년 12월', numbers: [7, 12, 18, 23, 31, 42], bonus: 15 },
    { date: '2026년 1월', numbers: [3, 9, 16, 25, 33, 40], bonus: 11 },
    { date: '2026년 2월', numbers: [5, 14, 21, 28, 35, 44], bonus: 19 }
];

// 참고 데이터 표시 함수
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
    generateBtn.addEventListener('click', () => {
        const { numbers, bonusNumber } = generateLottoNumbers();
        displayNumbers(numbers, bonusNumber);
        addToHistory(numbers, bonusNumber);
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
