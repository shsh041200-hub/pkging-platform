-- KOR-549: Rollback KOR-519 keyword-mapping search logic (board directive)
-- Removes product_category_mapping table and recommend_companies_by_product RPC

REVOKE EXECUTE ON FUNCTION recommend_companies_by_product FROM anon, authenticated;
DROP FUNCTION IF EXISTS recommend_companies_by_product;
DROP TABLE IF EXISTS product_category_mapping;
