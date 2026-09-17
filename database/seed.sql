-- ==========================================================================
-- CampusFind AI – Seed Data
-- ==========================================================================

USE campusfind;

-- Clean existing data
DELETE FROM NOTIFICATION;
DELETE FROM CLAIM;
DELETE FROM `MATCH`;
DELETE FROM FOUND_ITEM_IMAGE;
DELETE FROM LOST_ITEM_IMAGE;
DELETE FROM FOUND_ITEM;
DELETE FROM LOST_ITEM;
DELETE FROM ADMIN;
DELETE FROM STUDENT;

-- Reset Auto-Increment
ALTER TABLE STUDENT AUTO_INCREMENT = 1;
ALTER TABLE ADMIN AUTO_INCREMENT = 1;
ALTER TABLE LOST_ITEM AUTO_INCREMENT = 1;
ALTER TABLE FOUND_ITEM AUTO_INCREMENT = 1;
ALTER TABLE CLAIM AUTO_INCREMENT = 1;
ALTER TABLE `MATCH` AUTO_INCREMENT = 1;
ALTER TABLE NOTIFICATION AUTO_INCREMENT = 1;

-- 1. Seed Students
INSERT INTO STUDENT (Name, Email, Phone, Department, Year, Hostel, Password) VALUES
('Aarav Sharma', 'aarav.sharma@college.edu', '9876543210', 'Computer Science', 3, 'Bhabha Hall', '$2a$10$SampleHashedPassword1'),
('Priya Patel', 'priya.patel@college.edu', '9876543211', 'Electronics', 2, 'Gargi Hall', '$2a$10$SampleHashedPassword2');

-- 2. Seed Admins
INSERT INTO ADMIN (Name, Email) VALUES
('Chief Security Admin', 'admin.security@college.edu'),
('Assistant Admin', 'admin.assistant@college.edu');

-- 3. Seed Lost Items (AdminID NULL = Pending Verification; AdminID set = Verified)
INSERT INTO LOST_ITEM (ItemName, Category, Brand, Color, Description, DateLost, LostLocation, Status, StudentID, AdminID) VALUES
('Blue HP Laptop', 'Electronics', 'HP', 'Blue', 'HP Pavilion laptop with college stickers', '2026-09-10', 'Central Library Ground Floor', 'Open', 1, NULL),
('Black Leather Wallet', 'Personal Accessories', 'Titan', 'Black', 'Contains student ID and cash', '2026-09-11', 'Main Canteen', 'Open', 2, NULL),
('Red Water Bottle', 'Accessories', 'Milton', 'Red', 'Stainless steel 1L water bottle', '2026-09-08', 'Sports Complex', 'Open', 1, 1);

-- 4. Seed Found Items (AdminID NULL = Pending Verification; AdminID set = Verified)
INSERT INTO FOUND_ITEM (ItemName, Category, Brand, Color, Description, DateFound, FoundLocation, Status, StudentID, AdminID) VALUES
('Keys with Blue Keychain', 'Keys', NULL, 'Silver', 'Bunch of 3 keys with a blue dragon keychain', '2026-09-12', 'Academic Block A Room 102', 'Open', 2, NULL),
('Calculators Casio FX-991EX', 'Electronics', 'Casio', 'Black', 'Scientific calculator with name initials AP', '2026-09-13', 'Lecture Hall 3', 'Open', 1, NULL),
('Grey Earbuds Case', 'Electronics', 'Realme', 'Grey', 'Empty charging case for wireless earbuds', '2026-09-09', 'Auditorium', 'Open', 2, 1);

-- 5. Seed Claims
INSERT INTO CLAIM (ClaimDate, ClaimStatus, VerificationNotes, StudentID, FoundID, AdminID) VALUES
('2026-09-13 10:00:00', 'Pending', NULL, 1, 1, NULL),
('2026-09-13 11:30:00', 'Approved', 'Verified student ownership via serial number', 2, 3, 1);

-- 6. Seed Matches (Sample matches created by match service)
INSERT INTO `MATCH` (MatchDate, MatchStatus, MatchScore, LostID, FoundID) VALUES
('2026-09-14 12:00:00', 'Pending', 88.50, 1, 2);

-- 7. Seed Notifications
INSERT INTO NOTIFICATION (Message, Date, ReadStatus, StudentID, MatchID) VALUES
('Potential match found for your Blue HP Laptop with 88.50% confidence score.', '2026-09-14 12:01:00', false, 1, 1),
('Your claim for Grey Earbuds Case has been approved.', '2026-09-13 11:31:00', true, 2, NULL);
