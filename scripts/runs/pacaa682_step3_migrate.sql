-- PACAA-682 Step 3: Dry-run data migration SQL
-- Reclassify paper → corrugated_box / label_sticker
-- REQUIRES: 20260514001_add_corrugated_box_enum.sql applied first
-- REQUIRES: CEO approval before running --apply
-- Idempotency: WHERE category='paper' guard prevents double-run

BEGIN;

-- Step 3a: paper → corrugated_box (39 companies)
-- Signals: explicit corrugated keywords in name/subcategory + vendor_candidates canonical links
UPDATE companies SET category = 'corrugated_box'
WHERE id IN (
  '232fefd6-0dd4-4132-9f40-348e42a6a06f',
  '977b1917-a48b-4303-b735-bca62aa7a4e8',
  '7224120e-5f4b-4cd1-94ee-065c7a44898a',
  'acd84d6d-fbe3-447b-b926-a4a036c474bd',
  'd0450e9d-eb4e-4959-9807-243bcc668d2f',
  '9198a052-9970-4599-9f05-e8c50a56266d',
  '3f0e75b4-1404-4f08-a89c-214b2047c8b9',
  'c91e8e45-bfd4-4a00-be57-4f42c4fa20e8',
  'ca0a47c9-62d9-4f39-bfaa-05e895aacdac',
  '44a50f1a-e823-4070-9523-7ce498110bcf',
  '662d26fb-a4b5-4046-8c0b-ad27e3c90037',
  '0f888f34-6339-492f-a881-8666dff305c5',
  '55f6462a-7fc0-4ec2-a38e-bb2597f57900',
  '05ea6d91-79a7-48c1-8f50-76d1ec8b2693',
  'a698a7f7-4ae8-4d8e-8d5b-9c0cc32ab08e',
  'ae65d84a-4ea4-431b-8266-dd07084a9560',
  'f597ded1-d783-4b66-bdb6-16a05297313c',
  'b8348ea9-a6b6-4dc2-9385-b9273d58afc6',
  '2a44192d-eabf-42af-b2fa-60ca52fd83d6',
  '32d807ac-7810-4e30-a198-97470b85dc3d',
  'c3eefd45-c8db-49f3-8505-a2e51deac0ce',
  '3528ffe9-6960-4973-9beb-383122ae1632',
  '0ec83a6b-59dc-488d-98c5-9c01500996c7',
  '161694fd-4190-4608-ac0f-f68132d9ffc4',
  '1b5ef14c-7649-4994-a670-785e1fbfff6f',
  '957e6c71-ad94-418c-b798-b826a17b37f1',
  '2211a103-45db-4aeb-9371-dcbaba7f24b7',
  '5a41e78c-f5bd-4125-8abe-9601d4a921e6',
  '5c9f692f-8edf-44b2-b74c-d66f64095979',
  '1c84dd2b-9407-458b-b7e5-8c71ac8ab335',
  '108e80b7-e273-4106-970a-19a8d7b26e06',
  '62f6fb8d-9e92-4d1d-978a-596c69afc87b',
  'f23a9c80-bc72-4d45-9d1d-90f93d802c2f',
  'ad42ffa7-f4cb-4925-b316-62528f409ff3',
  '8d1c5b5c-3b67-4d84-ab15-d9c121f8650a',
  '4f446ca4-9e64-4345-83f0-0ebb3051dc19',
  '3ee1d80e-774a-4ee6-8173-1fba363f0799',
  '947ea340-e3f5-4c44-a22c-69295dfd34f2',
  'eefe2455-8712-415a-8ed0-ae76f5a69649'
)
AND category = 'paper';

-- Step 3b: paper → label_sticker (4 companies)
-- Signals: explicit label/sticker keywords in name/subcategory
UPDATE companies SET category = 'label_sticker'
WHERE id IN (
  '01469351-f53f-45c0-9969-fa6c59e2142a',
  '8b9105fb-aeb3-4da9-9bcf-a4d19f919ff3',
  'f826a393-c5e5-49d9-bfbc-eef9fd878719',
  'a912cd7b-61a5-424c-a6e5-03f5eac99bbd'
)
AND category = 'paper';

-- Verification queries (run before COMMIT to confirm counts):
-- SELECT COUNT(*) FROM companies WHERE category = 'corrugated_box';
-- Expected: 39
-- SELECT COUNT(*) FROM companies WHERE category = 'label_sticker' AND id IN (<label_ids>);
-- Expected additional label_sticker: 4

ROLLBACK; -- Change to COMMIT after CEO approval