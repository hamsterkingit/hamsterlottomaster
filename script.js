// Pokemon 스타일 로또 번호 생성기

// Supabase 초기화 완료를 기다리는 함수
function waitForSupabase(timeout = 15000) {
    return new Promise((resolve, reject) => {
        if (window.supabaseInitialized && window.supabaseClient) {
            resolve(window.supabaseClient);
            return;
        }
        
        if (window.supabaseInitPromise) {
            window.supabaseInitPromise
                .then(() => {
                    if (window.supabaseClient) {
                        resolve(window.supabaseClient);
                    } else {
                        reject(new Error('Supabase 초기화 실패'));
                    }
                })
                .catch(reject);
            return;
        }
        
        if (typeof initSupabase === 'function') {
            initSupabase().then(() => {
                if (window.supabaseClient) {
                    resolve(window.supabaseClient);
                } else {
                    reject(new Error('초기화 실패'));
                }
            }).catch(reject);
            return;
        }
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Supabase 초기화 타임아웃'));
        }, timeout);
        
        let checkCount = 0;
        const maxChecks = timeout / 100;
        
        const checkInterval = setInterval(() => {
            checkCount++;
            
            if (window.supabaseInitialized && window.supabaseClient) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                resolve(window.supabaseClient);
            } else if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                reject(new Error('Supabase 초기화 타임아웃'));
            }
        }, 100);
    });
}

// 로또 번호 생성
function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    numbers.sort((a, b) => a - b);
    
    let bonusNumber;
    do {
        bonusNumber = Math.floor(Math.random() * 45) + 1;
    } while (numbers.includes(bonusNumber));
    
    return { numbers, bonusNumber };
}

// 포켓몬 이모지 매핑 (1-45)
const pokemonEmojis = [
    '🐛', '🐝', '🦋', '🔥', '💧', '⚡', '🌿', '🌱', '🌺', '🍄',
    '🦎', '🐢', '🐍', '🦅', '🦉', '🐦', '🦆', '🦢', '🐤', '🐓',
    '🐴', '🦄', '🐮', '🐷', '🐽', '🐗', '🦓', '🦌', '🐕', '🐩',
    '🐈', '🐅', '🐆', '🦁', '🐯', '🐲', '🐉', '🦕', '🦖', '🐊',
    '🐋', '🐬', '🦈', '🐟', '🐠'
];

function getPokemonEmoji(number) {
    return pokemonEmojis[number - 1] || '⭐';
}

// 현재 세트 표시
function displayCurrentSet(numbers, bonusNumber) {
    const currentSetBox = document.getElementById('currentSetBox');
    const currentSetNumbers = document.getElementById('currentSetNumbers');
    const currentPokemonFrames = document.getElementById('currentPokemonFrames');
    
    currentSetNumbers.textContent = numbers.join('-');
    currentPokemonFrames.innerHTML = '';
    
    numbers.forEach((num, index) => {
        const frame = document.createElement('div');
        frame.className = 'pokemon-frame';
        
        const sprite = document.createElement('div');
        sprite.className = 'pokemon-sprite';
        sprite.textContent = getPokemonEmoji(num);
        
        const number = document.createElement('div');
        number.className = 'pokemon-number';
        number.textContent = num;
        
        frame.appendChild(sprite);
        frame.appendChild(number);
        currentPokemonFrames.appendChild(frame);
    });
    
    currentSetBox.style.display = 'block';
}

// 저장된 번호 표시
let savedSets = [];
let currentPage = 1;
const itemsPerPage = 2;

function displaySavedNumbers() {
    const container = document.getElementById('savedNumbers');
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    
    container.innerHTML = '';
    
    if (savedSets.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #2d5016; font-size: 10px; padding: 20px;">저장된 번호가 없습니다.</div>';
        pagination.style.display = 'none';
        return;
    }
    
    const totalPages = Math.ceil(savedSets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSets = savedSets.slice(startIndex, endIndex);
    
    currentSets.forEach(set => {
        const savedSet = document.createElement('div');
        savedSet.className = 'saved-set';
        
        const timestamp = document.createElement('div');
        timestamp.className = 'saved-timestamp';
        timestamp.textContent = set.timestamp;
        
        const frames = document.createElement('div');
        frames.className = 'saved-pokemon-frames';
        
        set.numbers.forEach(num => {
            const frame = document.createElement('div');
            frame.className = 'pokemon-frame';
            
            const sprite = document.createElement('div');
            sprite.className = 'pokemon-sprite';
            sprite.textContent = getPokemonEmoji(num);
            
            const number = document.createElement('div');
            number.className = 'pokemon-number';
            number.textContent = num;
            
            frame.appendChild(sprite);
            frame.appendChild(number);
            frames.appendChild(frame);
        });
        
        savedSet.appendChild(timestamp);
        savedSet.appendChild(frames);
        container.appendChild(savedSet);
    });
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        pageInfo.textContent = `${currentPage} / ${totalPages}`;
    } else {
        pagination.style.display = 'none';
    }
}

// Supabase에 저장
async function saveToSupabase(numbers, bonusNumber) {
    try {
        const client = await waitForSupabase(10000);
        
        if (!client) {
            console.error('❌ Supabase 클라이언트를 가져올 수 없습니다.');
            return;
        }

        const { data, error } = await client
            .from('lotto_numbers')
            .insert([{
                numbers: numbers,
                bonus_number: bonusNumber
            }])
            .select();

        if (error) {
            console.error('❌ Supabase 저장 오류:', error);
        } else {
            console.log('✅ Supabase에 저장 완료:', data);
        }
    } catch (err) {
        console.error('저장 중 예외 발생:', err);
    }
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const setCountInput = document.getElementById('setCount');
    const generationMessage = document.getElementById('generationMessage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    // 번호 생성 버튼
    generateBtn.addEventListener('click', async () => {
        const setCount = parseInt(setCountInput.value) || 1;
        generationMessage.textContent = '';
        
        for (let i = 0; i < setCount; i++) {
            const { numbers, bonusNumber } = generateLottoNumbers();
            
            // 현재 세트 표시 (마지막 세트만)
            if (i === setCount - 1) {
                displayCurrentSet(numbers, bonusNumber);
            }
            
            // 저장
            const timestamp = new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            
            savedSets.unshift({
                numbers: numbers,
                bonusNumber: bonusNumber,
                timestamp: timestamp
            });
            
            // Supabase에 저장
            await saveToSupabase(numbers, bonusNumber);
            
            // 약간의 딜레이
            if (i < setCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        generationMessage.textContent = '번호 생성 완료!';
        currentPage = 1;
        displaySavedNumbers();
    });
    
    // 페이지네이션
    prevPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(savedSets.length / itemsPerPage);
        if (currentPage > 1) {
            currentPage--;
            displaySavedNumbers();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(savedSets.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displaySavedNumbers();
        }
    });
    
    // 초기 표시
    displaySavedNumbers();
    displayRecentWinners();
});

// 최근 당첨자 데이터 (이전 3개월 1등 당첨 번호 - 샘플 데이터)
const previousWinningNumbers = [
    { date: '2025.12.07', numbers: [7, 12, 18, 23, 31, 42], bonus: 15 },
    { date: '2025.12.14', numbers: [3, 9, 16, 25, 33, 40], bonus: 11 },
    { date: '2025.12.21', numbers: [5, 14, 21, 28, 35, 44], bonus: 19 },
    { date: '2025.12.28', numbers: [2, 11, 17, 26, 32, 41], bonus: 8 },
    { date: '2026.01.04', numbers: [1, 8, 15, 22, 29, 38], bonus: 13 },
    { date: '2026.01.11', numbers: [4, 10, 19, 27, 34, 43], bonus: 6 },
    { date: '2026.01.18', numbers: [6, 13, 20, 24, 30, 39], bonus: 14 },
    { date: '2026.01.25', numbers: [9, 16, 21, 28, 35, 45], bonus: 7 },
    { date: '2026.02.01', numbers: [3, 11, 18, 25, 32, 41], bonus: 12 },
    { date: '2026.02.08', numbers: [5, 14, 19, 26, 33, 42], bonus: 9 },
    { date: '2026.02.15', numbers: [2, 10, 17, 24, 31, 40], bonus: 16 },
    { date: '2026.02.22', numbers: [4, 12, 20, 27, 34, 43], bonus: 5 }
];

// 최근 당첨자 표시
function displayRecentWinners() {
    const container = document.getElementById('recentWinners');
    container.innerHTML = '';
    
    if (previousWinningNumbers.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #2d5016; font-size: 10px; padding: 20px;">당첨 정보가 없습니다.</div>';
        return;
    }
    
    // 최근 3개만 표시
    const recentWinners = previousWinningNumbers.slice(0, 3);
    
    recentWinners.forEach(winner => {
        const winnerSet = document.createElement('div');
        winnerSet.className = 'saved-set';
        winnerSet.style.marginBottom = '15px';
        
        const date = document.createElement('div');
        date.className = 'saved-timestamp';
        date.textContent = winner.date;
        
        const frames = document.createElement('div');
        frames.className = 'saved-pokemon-frames';
        
        winner.numbers.forEach(num => {
            const frame = document.createElement('div');
            frame.className = 'pokemon-frame';
            
            const sprite = document.createElement('div');
            sprite.className = 'pokemon-sprite';
            sprite.textContent = getPokemonEmoji(num);
            
            const number = document.createElement('div');
            number.className = 'pokemon-number';
            number.textContent = num;
            
            frame.appendChild(sprite);
            frame.appendChild(number);
            frames.appendChild(frame);
        });
        
        // 보너스 번호
        const bonusFrame = document.createElement('div');
        bonusFrame.className = 'pokemon-frame';
        bonusFrame.style.border = '3px solid #ff6b6b';
        
        const bonusSprite = document.createElement('div');
        bonusSprite.className = 'pokemon-sprite';
        bonusSprite.textContent = getPokemonEmoji(winner.bonus);
        bonusSprite.style.background = '#ff6b6b';
        
        const bonusNumber = document.createElement('div');
        bonusNumber.className = 'pokemon-number';
        bonusNumber.textContent = `+${winner.bonus}`;
        bonusNumber.style.color = '#ff6b6b';
        
        bonusFrame.appendChild(bonusSprite);
        bonusFrame.appendChild(bonusNumber);
        frames.appendChild(bonusFrame);
        
        winnerSet.appendChild(date);
        winnerSet.appendChild(frames);
        container.appendChild(winnerSet);
    });
}
