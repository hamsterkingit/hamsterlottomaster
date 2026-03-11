-- 로또 번호 추천 서비스용 테이블 생성 쿼리
-- Supabase SQL Editor에서 실행하세요

-- 1. 로또 번호 저장 테이블 생성
CREATE TABLE IF NOT EXISTS lotto_numbers (
  id BIGSERIAL PRIMARY KEY,
  numbers INTEGER[] NOT NULL,  -- 메인 번호 6개 배열 (예: [1, 5, 12, 23, 35, 42])
  bonus_number INTEGER NOT NULL,  -- 보너스 번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 생성 시간
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 수정 시간 (향후 확장용)
);

-- 2. 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_lotto_created_at ON lotto_numbers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lotto_bonus_number ON lotto_numbers(bonus_number);

-- 3. updated_at 자동 업데이트 함수 (선택사항)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. updated_at 자동 업데이트 트리거 (선택사항)
CREATE TRIGGER update_lotto_numbers_updated_at 
    BEFORE UPDATE ON lotto_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) 활성화
ALTER TABLE lotto_numbers ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 설정 (모든 사용자가 읽고 쓸 수 있도록 - 개발용)
-- ⚠️ 프로덕션 환경에서는 더 엄격한 정책을 설정하세요!

-- 모든 사용자가 읽을 수 있음
CREATE POLICY "Allow public read access" ON lotto_numbers
  FOR SELECT
  USING (true);

-- 모든 사용자가 쓸 수 있음
CREATE POLICY "Allow public insert access" ON lotto_numbers
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 업데이트할 수 있음 (선택사항)
CREATE POLICY "Allow public update access" ON lotto_numbers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 모든 사용자가 삭제할 수 있음 (선택사항 - 보통은 비활성화)
-- CREATE POLICY "Allow public delete access" ON lotto_numbers
--   FOR DELETE
--   USING (true);

-- 7. 테이블 코멘트 추가 (선택사항)
COMMENT ON TABLE lotto_numbers IS '로또 번호 추천 서비스에서 생성된 번호를 저장하는 테이블';
COMMENT ON COLUMN lotto_numbers.numbers IS '메인 번호 6개 배열';
COMMENT ON COLUMN lotto_numbers.bonus_number IS '보너스 번호';
COMMENT ON COLUMN lotto_numbers.created_at IS '번호 생성 시간';

-- 8. 데이터 검증 함수 (선택사항 - 번호 유효성 검사)
CREATE OR REPLACE FUNCTION validate_lotto_numbers(numbers_array INTEGER[], bonus INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- 메인 번호가 6개인지 확인
    IF array_length(numbers_array, 1) != 6 THEN
        RETURN FALSE;
    END IF;
    
    -- 모든 번호가 1-45 범위인지 확인
    IF EXISTS (
        SELECT 1 FROM unnest(numbers_array) AS num 
        WHERE num < 1 OR num > 45
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- 보너스 번호가 1-45 범위인지 확인
    IF bonus < 1 OR bonus > 45 THEN
        RETURN FALSE;
    END IF;
    
    -- 보너스 번호가 메인 번호와 중복되지 않는지 확인
    IF bonus = ANY(numbers_array) THEN
        RETURN FALSE;
    END IF;
    
    -- 메인 번호에 중복이 없는지 확인
    IF array_length(numbers_array, 1) != array_length(array(SELECT DISTINCT unnest(numbers_array)), 1) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. 데이터 검증 트리거 (선택사항)
CREATE OR REPLACE FUNCTION check_lotto_numbers()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_lotto_numbers(NEW.numbers, NEW.bonus_number) THEN
        RAISE EXCEPTION 'Invalid lotto numbers: numbers must be 6 unique numbers between 1-45, bonus must be different from main numbers';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_lotto_numbers_trigger
    BEFORE INSERT OR UPDATE ON lotto_numbers
    FOR EACH ROW
    EXECUTE FUNCTION check_lotto_numbers();

-- 10. 테스트 데이터 삽입 (선택사항 - 테스트용)
-- INSERT INTO lotto_numbers (numbers, bonus_number) 
-- VALUES 
--   (ARRAY[1, 5, 12, 23, 35, 42], 7),
--   (ARRAY[3, 9, 16, 25, 33, 40], 11),
--   (ARRAY[2, 8, 15, 22, 31, 44], 19);

-- 11. 조회 예제 쿼리
-- 최근 10개 조회
-- SELECT * FROM lotto_numbers ORDER BY created_at DESC LIMIT 10;

-- 오늘 생성된 번호 조회
-- SELECT * FROM lotto_numbers WHERE DATE(created_at) = CURRENT_DATE;

-- 특정 번호가 포함된 조회
-- SELECT * FROM lotto_numbers WHERE 7 = ANY(numbers);
