# Vercel 환경변수 설정 가이드

## 1단계: Vercel 대시보드에서 환경변수 설정

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 다음 환경변수 추가:

### 필수 환경변수

| 변수 이름 | 값 | 설명 |
|---------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key |

또는 다음 중 하나를 사용할 수 있어요:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`

### 환경별 설정 (선택사항)

각 환경(Production, Preview, Development)에 대해 다른 값을 설정할 수 있어요:
- **Production**: 프로덕션 환경
- **Preview**: PR/브랜치별 미리보기
- **Development**: 로컬 개발 환경

## 2단계: 환경변수 확인

환경변수를 추가한 후:
1. **Redeploy** 버튼 클릭 (또는 새 커밋 푸시)
2. 배포 완료 후 `/api/config` 엔드포인트 확인:
   ```
   https://your-project.vercel.app/api/config
   ```
3. JSON 응답이 정상적으로 반환되는지 확인

## 3단계: 로컬 개발 설정 (선택사항)

로컬에서 개발할 때는:

1. `supabase-config.local.js.example` 파일을 복사
2. `supabase-config.local.js`로 이름 변경
3. 실제 Supabase URL과 Key 입력
4. `index.html`에서 로컬 설정 파일 로드 추가:

```html
<!-- 로컬 개발용 (개발 시에만 주석 해제) -->
<!-- <script src="supabase-config.local.js"></script> -->
```

## 문제 해결

### 환경변수가 적용되지 않는 경우
- Vercel에서 **Redeploy** 실행
- 환경변수 이름이 정확한지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### API 엔드포인트가 404인 경우
- `vercel.json` 파일이 프로젝트 루트에 있는지 확인
- `api/config.js` 파일이 올바른 위치에 있는지 확인

### 로컬에서 테스트하는 경우
- `supabase-config.local.js` 파일 사용
- 또는 로컬 서버에서 환경변수 설정
