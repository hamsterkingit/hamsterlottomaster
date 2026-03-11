# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: "lotto-numbers")
4. 데이터베이스 비밀번호 설정
5. 리전 선택 (가까운 리전 선택)
6. 프로젝트 생성 완료 대기 (약 2분)

## 2단계: 테이블 생성

Supabase 대시보드에서 **SQL Editor**로 이동 후 다음 중 하나를 선택하세요:

### 간단한 버전 (추천)
`supabase-table-simple.sql` 파일의 내용을 복사해서 실행하세요.
- 기본 테이블 생성
- 인덱스 및 RLS 설정
- 빠르고 간단함

### 상세한 버전
`supabase-table.sql` 파일의 내용을 복사해서 실행하세요.
- 데이터 검증 함수 포함
- 자동 업데이트 트리거
- 더 엄격한 데이터 검증
- 주석 및 설명 포함

**실행 방법:**
1. Supabase 대시보드 → SQL Editor
2. "New query" 클릭
3. SQL 파일 내용 복사 & 붙여넣기
4. "Run" 버튼 클릭

## 3단계: API 키 확인

1. Supabase 대시보드에서 "Settings" → "API" 이동
2. 다음 정보 복사:
   - **Project URL** (예: https://xxxxx.supabase.co)
   - **anon public** 키

## 4단계: 설정 파일 업데이트

`supabase-config.js` 파일을 열고 다음을 업데이트:

```javascript
const SUPABASE_URL = '여기에_Project_URL_붙여넣기';
const SUPABASE_ANON_KEY = '여기에_anon_key_붙여넣기';
```

## 5단계: 완료!

이제 로또 번호를 생성하면 자동으로 Supabase에 저장됩니다!
