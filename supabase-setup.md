# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: "lotto-numbers")
4. 데이터베이스 비밀번호 설정
5. 리전 선택 (가까운 리전 선택)
6. 프로젝트 생성 완료 대기 (약 2분)

## 2단계: 테이블 생성

Supabase 대시보드에서 SQL Editor로 이동 후 다음 SQL 실행:

```sql
-- 로또 번호 저장 테이블 생성
CREATE TABLE lotto_numbers (
  id BIGSERIAL PRIMARY KEY,
  numbers INTEGER[] NOT NULL,  -- 메인 번호 6개 배열
  bonus_number INTEGER NOT NULL,  -- 보너스 번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_lotto_created_at ON lotto_numbers(created_at DESC);

-- Row Level Security (RLS) 설정 (선택사항)
ALTER TABLE lotto_numbers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정 (개발용)
CREATE POLICY "Allow all operations" ON lotto_numbers
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

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
