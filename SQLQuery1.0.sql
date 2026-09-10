-- Safely remove legacy placeholder rows with invalid dates
DELETE FROM RentalAgreements 
WHERE EndDate < '2026-01-01' OR StartDate < '2026-01-01';
