-- KOR-531: Clear companies.phone and block future writes — KOR-371 compliance
-- Option C applied: NULL all existing phone values + DB trigger to prevent re-introduction
-- Prior art: KOR-103 cleared address/email; this migration extends same pattern to phone

-- Step 1: NULL out all existing phone data (571 rows: 286 association, 285 manual)
UPDATE companies SET phone = NULL WHERE phone IS NOT NULL;

-- Step 2: Trigger function that blocks any future INSERT or UPDATE of phone
CREATE OR REPLACE FUNCTION prevent_companies_phone_write()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.phone IS NOT NULL THEN
    RAISE EXCEPTION 'companies.phone is prohibited by company policy (KOR-371). Phone numbers must not be collected or stored.';
  END IF;
  RETURN NEW;
END;
$$;

-- Step 3: Attach trigger to companies table
DROP TRIGGER IF EXISTS trg_no_phone_write ON companies;
CREATE TRIGGER trg_no_phone_write
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION prevent_companies_phone_write();

-- Down:
-- DROP TRIGGER IF EXISTS trg_no_phone_write ON companies;
-- DROP FUNCTION IF EXISTS prevent_companies_phone_write();
-- (phone values are not recoverable after up migration runs)
