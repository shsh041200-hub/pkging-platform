-- KOR-266: Initialize delivery_regions for existing companies.
-- Strategy: HQ province → minimum delivery region (rules-based, no LLM).
-- Two province names in DB differ from DeliveryRegion type:
--   '강원도'   → '강원특별자치도'
--   '전라북도' → '전북특별자치도'
-- Companies with NULL province keep empty array (coverage unknown).

UPDATE companies
SET delivery_regions = ARRAY[
  CASE province
    WHEN '강원도'   THEN '강원특별자치도'
    WHEN '전라북도' THEN '전북특별자치도'
    ELSE province
  END
]
WHERE province IS NOT NULL
  AND delivery_regions = '{}';

-- Down migration:
-- UPDATE companies SET delivery_regions = '{}'
-- WHERE array_length(delivery_regions, 1) = 1
--   AND delivery_regions[1] = ANY(ARRAY[
--     '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시',
--     '대전광역시','울산광역시','세종특별자치시','경기도','강원특별자치도',
--     '충청북도','충청남도','전북특별자치도','전라남도','경상북도',
--     '경상남도','제주특별자치도'
--   ]);
