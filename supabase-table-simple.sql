-- 간단한 버전: 로또 번호 저장 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 테이블 생성
CREATE TABLE IF NOT EXISTS lotto_numbers (
  id BIGSERIAL PRIMARY KEY,
  numbers INTEGER[] NOT NULL,  -- 메인 번호 6개 배열
  bonus_number INTEGER NOT NULL,  -- 보너스 번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_lotto_created_at ON lotto_numbers(created_at DESC);

-- Row Level Security 활성화
ALTER TABLE lotto_numbers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정
CREATE POLICY "Allow all operations" ON lotto_numbers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 완료! 이제 로또 번호를 저장할 수 있습니다.
