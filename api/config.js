// Vercel 서버리스 함수: Supabase 설정 제공
// 이 함수는 Vercel 환경변수에서 Supabase 설정을 읽어서 반환합니다.

export default function handler(req, res) {
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
  
  // Vercel 환경변수에서 Supabase 설정 읽기
  // 여러 환경변수 이름을 시도 (다양한 프레임워크 지원)
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
  
  // 환경변수가 설정되지 않은 경우
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ 
      error: 'Supabase 환경변수가 설정되지 않았습니다.',
      message: 'Vercel 대시보드에서 환경변수를 설정해주세요.',
      hint: '필요한 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    });
  }
  
  // 설정 반환
  return res.status(200).json({
    supabaseUrl: supabaseUrl,
    supabaseAnonKey: supabaseAnonKey
  });
}
