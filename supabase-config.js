// Supabase 설정 파일
// Vercel 환경변수를 사용하여 Supabase 클라이언트를 초기화합니다.

// ⚠️ 직접 설정 (우선순위: 최우선)
// Supabase URL을 여기에 입력하세요 (예: https://xxxxx.supabase.co)
const DIRECT_SUPABASE_URL = 'https://yqhbhdauxcbrqqxdnzty.supabase.co';
const DIRECT_SUPABASE_ANON_KEY = 'sb_publishable_4NjaqgP5ziSATLBVL75YJA_tUuc0DJK';

// 전역 변수로 선언 (다른 스크립트에서 접근 가능하도록)
window.supabaseClient = null;
window.supabaseInitialized = false;
window.supabaseInitPromise = null; // 초기화 Promise 저장

// Supabase 초기화 완료를 기다리는 함수
window.waitForSupabase = function(timeout = 10000) {
    return new Promise((resolve, reject) => {
        // 이미 초기화되어 있으면 바로 반환
        if (window.supabaseInitialized && window.supabaseClient) {
            resolve(window.supabaseClient);
            return;
        }
        
        // 초기화 중이면 Promise를 기다림
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
        
        // 타임아웃 설정
        const timeoutId = setTimeout(() => {
            reject(new Error('Supabase 초기화 타임아웃'));
        }, timeout);
        
        // 초기화 완료를 기다림
        const checkInterval = setInterval(() => {
            if (window.supabaseInitialized && window.supabaseClient) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                resolve(window.supabaseClient);
            }
        }, 100);
    });
};

// Vercel 환경변수에서 Supabase 설정 가져오기
async function initSupabase() {
    // 이미 초기화 중이면 기존 Promise 반환
    if (window.supabaseInitPromise) {
        return window.supabaseInitPromise;
    }
    
    // 초기화 Promise 생성
    window.supabaseInitPromise = (async () => {
        try {
        console.log('🔄 Supabase 초기화 시작...');
        console.log('📍 현재 URL:', window.location.href);
        
        // 1순위: 직접 설정된 값 사용 (최우선)
        if (DIRECT_SUPABASE_URL && DIRECT_SUPABASE_ANON_KEY && 
            DIRECT_SUPABASE_URL !== '' && DIRECT_SUPABASE_ANON_KEY !== '') {
            console.log('✅ 직접 설정된 Supabase 키 사용');
            
            if (!window.supabase) {
                console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
                return;
            }
            
            window.supabaseClient = window.supabase.createClient(DIRECT_SUPABASE_URL, DIRECT_SUPABASE_ANON_KEY);
            window.supabaseInitialized = true;
            console.log('✅ Supabase 클라이언트 초기화 완료! (직접 설정 사용)');
            console.log('📍 Supabase URL:', DIRECT_SUPABASE_URL.substring(0, 30) + '...');
            window.dispatchEvent(new CustomEvent('supabaseInitialized'));
            return window.supabaseClient;
        }
        
        // 2순위: 빌드 타임에 주입된 환경변수가 있는지 확인
        if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && 
            SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '') {
            console.log('✅ 빌드 타임에 주입된 환경변수 사용');
            
            if (!window.supabase) {
                console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
                return;
            }
            
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseInitialized = true;
            console.log('✅ Supabase 클라이언트 초기화 완료! (빌드 타임 주입)');
            window.dispatchEvent(new CustomEvent('supabaseInitialized'));
            return window.supabaseClient;
        }
        
        // API 엔드포인트에서 설정 가져오기 (폴백)
        console.log('📡 API 엔드포인트 방식 사용 (빌드 타임 주입 없음)');
        const apiUrl = '/api/config';
        console.log('📡 API 엔드포인트 호출:', apiUrl);
        console.log('📍 전체 URL:', window.location.origin + apiUrl);
        
        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
        } catch (fetchError) {
            console.error('❌ fetch 오류:', fetchError);
            console.error('💡 해결 방법:');
            console.error('   1. Vercel 대시보드에서 환경변수 설정');
            console.error('   2. package.json에 build 스크립트 추가 후 빌드');
            console.error('   3. 또는 api/config.js 서버리스 함수가 작동하는지 확인');
            throw new Error(`API 엔드포인트 호출 실패: ${fetchError.message}`);
        }
        
        console.log('📥 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            let errorText;
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = '응답 본문을 읽을 수 없습니다.';
            }
            
            console.error('❌ API 응답 오류:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
                url: window.location.origin + apiUrl
            });
            
            // 404 오류인 경우 (서버리스 함수가 없음)
            if (response.status === 404) {
                console.error('❌ /api/config 엔드포인트를 찾을 수 없습니다.');
                console.error('💡 해결 방법:');
                console.error('   1. Vercel 대시보드 → Deployments에서 최신 배포 확인');
                console.error('   2. api/config.js 파일이 올바른 위치에 있는지 확인');
                console.error('   3. vercel.json 파일이 있는지 확인');
                console.error('   4. 직접 테스트: ' + window.location.origin + apiUrl);
                console.error('   5. 또는 Vercel 환경변수를 설정하고 빌드 스크립트 사용');
            } else if (response.status === 500) {
                console.error('❌ 서버 오류 (500) - 환경변수가 설정되지 않았을 가능성이 높습니다.');
                console.error('💡 해결 방법:');
                console.error('   1. Vercel 대시보드 → Settings → Environment Variables');
                console.error('   2. NEXT_PUBLIC_SUPABASE_URL 추가');
                console.error('   3. NEXT_PUBLIC_SUPABASE_ANON_KEY 추가');
                console.error('   4. 환경변수 추가 후 반드시 Redeploy 실행!');
            }
            
            throw new Error(`환경변수를 가져올 수 없습니다. (${response.status}): ${errorText}`);
        }
        
        let config;
        try {
            config = await response.json();
        } catch (jsonError) {
            const text = await response.text();
            console.error('❌ JSON 파싱 오류:', jsonError);
            console.error('📄 응답 본문:', text);
            throw new Error(`응답을 JSON으로 파싱할 수 없습니다: ${jsonError.message}`);
        }
        
        console.log('📦 받은 설정:', {
            hasUrl: !!config.supabaseUrl,
            hasKey: !!config.supabaseAnonKey,
            urlLength: config.supabaseUrl?.length || 0,
            keyLength: config.supabaseAnonKey?.length || 0
        });
        
        // 디버깅 정보 출력
        if (config.debug) {
            console.log('🔍 환경변수 디버깅 정보:', config.debug);
            console.log('   - 사용된 URL 변수:', config.debug.usedUrlVar || '없음');
            console.log('   - 사용된 Key 변수:', config.debug.usedKeyVar || '없음');
            console.log('   - URL 길이:', config.debug.urlLength);
            console.log('   - Key 길이:', config.debug.keyLength);
        }
        
        if (config.error) {
            console.error('❌ Supabase 설정 오류:', config.error);
            console.error('📋 오류 상세:', config);
            if (config.debug) {
                console.error('🔍 환경변수 상태:', config.debug.envVarsStatus);
            }
            console.error('💡 해결 방법: Vercel 대시보드 → Settings → Environment Variables에서 다음을 설정하세요:');
            console.error('   - NEXT_PUBLIC_SUPABASE_URL');
            console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
            console.error('   설정 후 반드시 Redeploy 실행!');
            return;
        }
        
        // Supabase 클라이언트 초기화
        if (!window.supabase) {
            console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
            console.error('💡 해결 방법: index.html에서 Supabase CDN 스크립트가 로드되었는지 확인하세요.');
            return;
        }
        
        if (!config.supabaseUrl || !config.supabaseAnonKey) {
            console.error('❌ Supabase 설정이 없습니다:', config);
            console.error('💡 해결 방법: Vercel 환경변수를 설정하세요.');
            return;
        }
        
        window.supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        window.supabaseInitialized = true;
        console.log('✅ Supabase 클라이언트 초기화 완료! (API 엔드포인트 방식)');
        console.log('📍 Supabase URL:', config.supabaseUrl.substring(0, 30) + '...');
        
        // 초기화 완료 이벤트 발생
        window.dispatchEvent(new CustomEvent('supabaseInitialized'));
        
        return window.supabaseClient;
    } catch (error) {
        console.error('❌ Supabase 초기화 오류:', error);
        console.error('📋 오류 상세:', {
            message: error.message,
            stack: error.stack
        });
        console.error('💡 해결 방법:');
        console.error('   1. Vercel 대시보드 → Settings → Environment Variables 확인');
        console.error('   2. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 설정');
        console.error('   3. 환경변수 설정 후 Redeploy 실행');
        console.error('   4. 또는 빌드 스크립트를 사용하여 환경변수 주입');
        
        // 로컬 개발용 폴백 (선택사항)
        if (typeof loadLocalConfig === 'function') {
            loadLocalConfig();
        }
        
        throw error; // Promise를 reject하기 위해 에러 재발생
    }})();
    
    return window.supabaseInitPromise;
}

// 페이지 로드 시 Supabase 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
