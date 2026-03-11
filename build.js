// 빌드 스크립트: 환경변수를 HTML에 주입
// Vercel 빌드 시 실행되어 환경변수를 클라이언트 코드에 주입합니다.

const fs = require('fs');
const path = require('path');

// 환경변수 읽기
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  '';

// supabase-config.js 파일 읽기
const configPath = path.join(__dirname, 'supabase-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// 환경변수가 있으면 주입
if (supabaseUrl && supabaseAnonKey) {
  // 환경변수를 직접 사용하는 코드로 교체
  const newConfig = `// Supabase 설정 파일 (빌드 타임에 환경변수 주입됨)
// Vercel 환경변수를 사용하여 Supabase 클라이언트를 초기화합니다.

// 전역 변수로 선언
window.supabaseClient = null;
window.supabaseInitialized = false;
window.supabaseInitPromise = null;

// 빌드 타임에 주입된 환경변수
const SUPABASE_URL = '${supabaseUrl}';
const SUPABASE_ANON_KEY = '${supabaseAnonKey}';

// Supabase 초기화 함수
async function initSupabase() {
    try {
        console.log('🔄 Supabase 초기화 시작...');
        
        if (!window.supabase) {
            console.error('❌ Supabase 라이브러리가 로드되지 않았습니다.');
            return;
        }
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === '' || SUPABASE_ANON_KEY === '') {
            console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
            console.error('💡 Vercel 대시보드에서 환경변수를 설정하세요.');
            return;
        }
        
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseInitialized = true;
        console.log('✅ Supabase 클라이언트 초기화 완료!');
        console.log('📍 Supabase URL:', SUPABASE_URL.substring(0, 30) + '...');
        
        window.dispatchEvent(new CustomEvent('supabaseInitialized'));
        
        return window.supabaseClient;
    } catch (error) {
        console.error('❌ Supabase 초기화 오류:', error);
        throw error;
    }
}

// 페이지 로드 시 Supabase 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
`;

  fs.writeFileSync(configPath, newConfig, 'utf8');
  console.log('✅ 환경변수가 supabase-config.js에 주입되었습니다.');
} else {
  console.warn('⚠️ 환경변수가 설정되지 않았습니다. API 엔드포인트 방식을 사용합니다.');
}
