# 환경변수 연결 확인 가이드

## ✅ api/config.js와 Vercel Environment Variables 연결 확인

### 1. 코드 확인

`api/config.js` 파일은 다음 순서로 환경변수를 읽어요:

**Supabase URL (우선순위 순서):**
1. `NEXT_PUBLIC_SUPABASE_URL` ⭐ (추천)
2. `VITE_SUPABASE_URL`
3. `REACT_APP_SUPABASE_URL`
4. `SUPABASE_URL`

**Supabase Anon Key (우선순위 순서):**
1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⭐ (추천)
2. `VITE_SUPABASE_ANON_KEY`
3. `REACT_APP_SUPABASE_ANON_KEY`
4. `SUPABASE_ANON_KEY`

### 2. Vercel 환경변수 설정 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**
   - 다음 두 개가 **반드시** 있어야 해요:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **환경변수 값 확인**
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://xxxxx.supabase.co` 형식
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGc...` 형식 (긴 문자열)

### 3. 연결 테스트

#### 방법 1: API 엔드포인트 직접 테스트
```
https://your-site.vercel.app/api/config
```

**성공 응답 예시:**
```json
{
  "success": true,
  "supabaseUrl": "https://xxxxx.supabase.co",
  "supabaseAnonKey": "eyJhbGc...",
  "debug": {
    "usedUrlVar": "NEXT_PUBLIC_SUPABASE_URL",
    "usedKeyVar": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ...
  }
}
```

**실패 응답 예시:**
```json
{
  "error": "Supabase 환경변수가 설정되지 않았습니다.",
  "debug": {
    "foundUrl": false,
    "foundKey": false,
    "envVarsStatus": {
      "NEXT_PUBLIC_SUPABASE_URL": { "exists": false },
      ...
    }
  }
}
```

#### 방법 2: 테스트 페이지 사용
```
https://your-site.vercel.app/test-api.html
```

### 4. 문제 해결 체크리스트

- [ ] Vercel 대시보드에서 환경변수가 설정되어 있는지 확인
- [ ] 환경변수 이름이 정확한지 확인 (대소문자 구분!)
- [ ] 환경변수 값이 올바른지 확인 (공백 없이)
- [ ] 환경변수 추가 후 **Redeploy** 실행했는지 확인
- [ ] `/api/config` 엔드포인트가 200 응답을 반환하는지 확인
- [ ] 브라우저 콘솔에서 디버깅 정보 확인

### 5. 자주 발생하는 문제

#### 문제: 환경변수가 설정했는데도 안 됨
**해결:**
- 환경변수 추가 후 반드시 **Redeploy** 실행
- 환경변수 이름에 오타가 없는지 확인
- Production, Preview, Development 모두 체크했는지 확인

#### 문제: API 엔드포인트가 404
**해결:**
- `api/config.js` 파일이 올바른 위치에 있는지 확인
- 배포 로그에서 오류 확인
- Vercel이 서버리스 함수를 인식하는지 확인

#### 문제: 500 오류 발생
**해결:**
- 환경변수가 실제로 설정되었는지 확인
- `/api/config` 응답의 `debug` 정보 확인
- `envVarsStatus`에서 어떤 환경변수가 있는지 확인
