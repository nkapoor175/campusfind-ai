-- Run once on an existing database before deploying the recovery flow.
ALTER TABLE CLAIM ADD COLUMN LostID INT NULL,
  ADD CONSTRAINT fk_claim_lost FOREIGN KEY (LostID) REFERENCES LOST_ITEM(LostID) ON DELETE SET NULL;
ALTER TABLE FOUND_ITEM MODIFY Status ENUM('Open','Claimed','Returned','Closed') NOT NULL DEFAULT 'Open';
-- Preserve explicit links for existing claims where a confirmed match exists.
UPDATE CLAIM c SET LostID = (
  SELECT MIN(m.LostID) FROM MATCH_RECORD m JOIN LOST_ITEM l ON l.LostID = m.LostID
  WHERE m.FoundID = c.FoundID AND m.MatchStatus = 'Confirmed' AND l.StudentID = c.StudentID
);
-- Approval reserves the report; pickup closes it. Correct legacy pre-pickup closures.
UPDATE LOST_ITEM l JOIN CLAIM c ON c.LostID = l.LostID
JOIN FOUND_ITEM f ON f.FoundID = c.FoundID
SET l.Status = 'Matched'
WHERE c.ClaimStatus = 'Approved' AND f.Status = 'Claimed' AND l.Status = 'Closed';
-- Resolve legacy competing claims when an owner has already been approved.
INSERT INTO NOTIFICATION (Message, StudentID)
SELECT CONCAT('Your claim on "', LEFT(f.ItemName, 150), '" was rejected: another ownership claim was approved.'), c.StudentID
FROM CLAIM c JOIN FOUND_ITEM f ON f.FoundID = c.FoundID
WHERE c.ClaimStatus = 'Pending' AND EXISTS (
  SELECT 1 FROM CLAIM winner WHERE winner.FoundID = c.FoundID AND winner.ClaimStatus = 'Approved'
);
UPDATE CLAIM c JOIN CLAIM winner ON winner.FoundID = c.FoundID AND winner.ClaimStatus = 'Approved'
SET c.ClaimStatus = 'Rejected', c.VerificationNotes = 'Item approved for another claimant.', c.AdminID = winner.AdminID
WHERE c.ClaimStatus = 'Pending';
