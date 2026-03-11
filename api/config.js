// Vercel 서버리스 함수: Supabase 설정 제공
// 이 함수는 Vercel 환경변수에서 Supabase 설정을 읽어서 반환합니다.

module.exports = (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // 모든 환경변수 확인 (디버깅용)
  const allEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  };
  
  // Vercel 환경변수에서 Supabase 설정 읽기 (우선순위 순서대로)
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.SUPABASE_URL;
    
  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;
  
  // 환경변수 존재 여부 확인 (디버깅용)
  const envVarsStatus = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || '없음'
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || '없음'
    },
    VITE_SUPABASE_URL: {
      exists: !!process.env.VITE_SUPABASE_URL,
      length: process.env.VITE_SUPABASE_URL?.length || 0
    },
    VITE_SUPABASE_ANON_KEY: {
      exists: !!process.env.VITE_SUPABASE_ANON_KEY,
      length: process.env.VITE_SUPABASE_ANON_KEY?.length || 0
    },
    SUPABASE_URL: {
      exists: !!process.env.SUPABASE_URL,
      length: process.env.SUPABASE_URL?.length || 0
    },
    SUPABASE_ANON_KEY: {
      exists: !!process.env.SUPABASE_ANON_KEY,
      length: process.env.SUPABASE_ANON_KEY?.length || 0
    }
  };
  
  // 어떤 환경변수를 사용했는지 확인
  let usedUrlVar = null;
  let usedKeyVar = null;
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) usedUrlVar = 'NEXT_PUBLIC_SUPABASE_URL';
  else if (process.env.VITE_SUPABASE_URL) usedUrlVar = 'VITE_SUPABASE_URL';
  else if (process.env.REACT_APP_SUPABASE_URL) usedUrlVar = 'REACT_APP_SUPABASE_URL';
  else if (process.env.SUPABASE_URL) usedUrlVar = 'SUPABASE_URL';
  
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) usedKeyVar = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
  else if (process.env.VITE_SUPABASE_ANON_KEY) usedKeyVar = 'VITE_SUPABASE_ANON_KEY';
  else if (process.env.REACT_APP_SUPABASE_ANON_KEY) usedKeyVar = 'REACT_APP_SUPABASE_ANON_KEY';
  else if (process.env.SUPABASE_ANON_KEY) usedKeyVar = 'SUPABASE_ANON_KEY';
  
  // 환경변수가 설정되지 않은 경우
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ 
      error: 'Supabase 환경변수가 설정되지 않았습니다.',
      message: 'Vercel 대시보드에서 환경변수를 설정해주세요.',
      hint: '필요한 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY',
      debug: {
        foundUrl: !!supabaseUrl,
        foundKey: !!supabaseAnonKey,
        usedUrlVar: usedUrlVar,
        usedKeyVar: usedKeyVar,
        envVarsStatus: envVarsStatus,
        allEnvVarsPreview: Object.keys(allEnvVars).reduce((acc, key) => {
          acc[key] = allEnvVars[key] ? (allEnvVars[key].substring(0, 20) + '...') : '없음';
          return acc;
        }, {})
      },
      instructions: {
        step1: 'Vercel 대시보드 → Settings → Environment Variables 이동',
        step2: 'NEXT_PUBLIC_SUPABASE_URL 추가 (값: Supabase 프로젝트 URL)',
        step3: 'NEXT_PUBLIC_SUPABASE_ANON_KEY 추가 (값: Supabase anon key)',
        step4: '환경변수 추가 후 반드시 Redeploy 실행!'
      }
    });
  }
  
  // 설정 반환 (상세한 디버깅 정보 포함)
  return res.status(200).json({
    success: true,
    supabaseUrl: supabaseUrl,
    supabaseAnonKey: supabaseAnonKey,
    debug: {
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
      usedUrlVar: usedUrlVar,
      usedKeyVar: usedKeyVar,
      envVarsStatus: envVarsStatus,
      urlPreview: supabaseUrl.substring(0, 30) + '...',
      keyPreview: supabaseAnonKey.substring(0, 20) + '...'
    }
  });
};
