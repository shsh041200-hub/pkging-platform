-- KOR-103: Clear address and email data for user trust improvement
-- These fields contained crawled data that was unreliable.
-- Frontend no longer displays them; null out the data.

UPDATE companies SET address = NULL WHERE address IS NOT NULL;
UPDATE companies SET email = NULL WHERE email IS NOT NULL;
