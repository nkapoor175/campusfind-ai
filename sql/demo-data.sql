-- CampusFind AI - demo dataset
--
-- Loaded by `npm run demo:reset` right after sql/schema.sql has recreated empty tables. It relies on
-- the tables being empty (IDs below start at 1), so do not run it on a database that has data.
--
-- Logins:   students  navika@campus.edu, parthvi@campus.edu, rohan@campus.edu, aarav@campus.edu,
--                     ishita@campus.edu, kabir@campus.edu   -> password  Demo@12345
--           admin     admin@campus.edu                      -> password  Admin@12345
--
-- The data tells a few small stories so every screen has something to show:
--   Pending matches ........ lost bottle <-> found bottle, lost earphones <-> found earphones, lost backpack <-> found backpack
--   Confirmed + claim open . lost keys <-> found keys (Rohan has a Pending claim for the admin to decide)
--   Completed story ........ lost wallet <-> found wallet: claim approved, wallet Returned, lost report Closed
--   Rejected match ......... lost calculator <-> found calculator
--   Unverified reports ..... backpack, umbrella and calculator reports wait for the admin's "verify"
--   Not in the data ........ black headphones: reserved for the LIVE demo (see README "Demo")
--
-- Photos: demo/images/*.png are copied into uploads/ by the reset script and referenced below.

USE campusfind_ai;

INSERT INTO ADMIN (Name, Email, Password) VALUES
('Campus Security Admin', 'admin@campus.edu', '$2b$10$zK/KEKT9ksqQjpmkI8mrkORHsnKc6cewzsCVXD5VJh.LzC6BCTxtO');

INSERT INTO STUDENT (Name, Email, Phone, Department, Year, Hostel, Password) VALUES
('Navika Kapoor', 'navika@campus.edu', '9876543210', 'Computer Science', 3, 'Hostel A', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.'),
('Parthvi Sharma', 'parthvi@campus.edu', '9876543211', 'Computer Science', 3, 'Hostel B', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.'),
('Rohan Mehta', 'rohan@campus.edu', '9876543212', 'Electronics', 2, 'Hostel C', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.'),
('Aarav Singh', 'aarav@campus.edu', '9876543213', 'Mechanical', 4, 'Hostel D', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.'),
('Ishita Verma', 'ishita@campus.edu', '9876543214', 'Civil', 1, 'Hostel E', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.'),
('Kabir Nair', 'kabir@campus.edu', '9876543215', 'Information Technology', 2, 'Hostel B', '$2b$10$BkIrzmwDNiZ0MOBs2LeOHuOSI17r.IZ/q3GXqyg/.eZ7tolx6UbB.');

-- LOST_ITEM (ItemName, Category, Brand, Color, Description, DateLost, LostLocation, Status, StudentID, AdminID)
INSERT INTO LOST_ITEM (ItemName, Category, Brand, Color, Description, DateLost, LostLocation, Status, StudentID, AdminID) VALUES
('Water Bottle', 'Accessories', 'Milton', 'Blue', 'Steel water bottle with a dented cap, has a college sticker on it', '2026-10-01', 'Library', 'Open', 1, 1),
('Wired Earphones', 'Electronics', 'boAt', 'Black', 'Black wired earphones in a small pouch', '2026-10-02', 'Canteen', 'Open', 2, 1),
('Black Backpack', 'Bags', 'Wildcraft', 'Black', 'Black backpack with a laptop sleeve and a small football keychain', '2026-10-03', 'Auditorium', 'Open', 4, NULL),
('Brown Leather Wallet', 'Accessories', 'Fastrack', 'Brown', 'Brown leather wallet with a college ID card and some cash', '2026-09-28', 'Canteen', 'Closed', 5, 1),
('Hostel Room Keys', 'Accessories', 'Yale', 'Silver', 'Bunch of three silver keys with a red tag', '2026-10-04', 'Sports Complex', 'Matched', 3, 1),
('Blue Umbrella', 'Accessories', NULL, 'Blue', 'Large blue umbrella with a wooden handle', '2026-10-05', 'Bus Stop', 'Open', 6, NULL),
('Scientific Calculator', 'Electronics', 'Casio', 'Grey', 'Casio fx-991EX scientific calculator with a name written on the back', '2026-10-02', 'Exam Hall', 'Open', 1, NULL);

INSERT INTO LOST_ITEM_IMAGE (LostID, ImageURL) VALUES
(1, '/uploads/lost/demo-lost-1.png'),
(2, '/uploads/lost/demo-lost-2.png'),
(3, '/uploads/lost/demo-lost-3.png'),
(4, '/uploads/lost/demo-lost-4.png'),
(5, '/uploads/lost/demo-lost-5.png'),
(6, '/uploads/lost/demo-lost-6.png');

-- FOUND_ITEM (ItemName, Category, Brand, Color, Description, DateFound, FoundLocation, Status, StudentID, AdminID)
INSERT INTO FOUND_ITEM (ItemName, Category, Brand, Color, Description, DateFound, FoundLocation, Status, StudentID, AdminID) VALUES
('Steel Bottle', 'Accessories', 'Milton', 'Blue', 'Blue steel water bottle with a dented cap and a college sticker, found near the reading hall entrance', '2026-10-02', 'Library Entrance', 'Open', 3, 1),
('Earphones', 'Electronics', 'boAt', 'Black', 'Black wired earphones in a small pouch, picked up near the canteen tables', '2026-10-02', 'Canteen', 'Open', 3, 1),
('Brown Wallet', 'Accessories', 'Fastrack', 'Brown', 'Brown leather wallet with an ID card inside, found on a canteen table', '2026-09-29', 'Canteen', 'Returned', 6, 1),
('Keys with Red Tag', 'Accessories', 'Yale', 'Silver', 'Three silver keys on a ring with a red tag', '2026-10-05', 'Sports Complex Gate', 'Open', 4, 1),
('Casio Scientific Calculator', 'Electronics', 'Casio', 'Grey', 'Grey Casio fx-991EX scientific calculator with a name written on the back, left on a desk in the exam hall', '2026-10-03', 'Exam Hall', 'Open', 6, NULL),
('Black Wildcraft Backpack', 'Bags', 'Wildcraft', 'Black', 'Black backpack with a laptop sleeve and a football keychain, found in the auditorium', '2026-10-04', 'Auditorium', 'Open', 5, 1);

INSERT INTO FOUND_ITEM_IMAGE (FoundID, ImageURL) VALUES
(1, '/uploads/found/demo-found-1.png'),
(2, '/uploads/found/demo-found-2.png'),
(3, '/uploads/found/demo-found-3.png'),
(4, '/uploads/found/demo-found-4.png');

-- MATCH_RECORD (MatchDate, MatchStatus, LostID, FoundID). No score column: scores are never stored.
INSERT INTO MATCH_RECORD (MatchDate, MatchStatus, LostID, FoundID) VALUES
(NOW() - INTERVAL 2 DAY, 'Pending',   1, 1),
(NOW() - INTERVAL 2 DAY, 'Pending',   2, 2),
(NOW() - INTERVAL 6 DAY, 'Confirmed', 4, 3),
(NOW() - INTERVAL 1 DAY, 'Confirmed', 5, 4),
(NOW() - INTERVAL 1 DAY, 'Pending',   3, 6),
(NOW() - INTERVAL 2 DAY, 'Rejected',  7, 5);

-- CLAIM (ClaimDate, ClaimStatus, VerificationNotes, StudentID, FoundID, AdminID)
INSERT INTO CLAIM (ClaimDate, ClaimStatus, VerificationNotes, StudentID, FoundID, AdminID) VALUES
(NOW() - INTERVAL 5 DAY, 'Rejected', 'Could not describe what was inside the wallet', 2, 3, 1),
(NOW() - INTERVAL 5 DAY, 'Approved', 'Verified the college ID card at the security desk', 5, 3, 1),
(NOW() - INTERVAL 1 DAY, 'Pending',  NULL, 3, 4, NULL);

-- NOTIFICATION (Message, Date, ReadStatus, StudentID, MatchID). Wording matches what the app generates.
INSERT INTO NOTIFICATION (Message, Date, ReadStatus, StudentID, MatchID) VALUES
('Possible match for your lost "Water Bottle": a found item "Steel Bottle" looks similar (73%). Open Matches to review.', NOW() - INTERVAL 2 DAY, FALSE, 1, 1),
('The item you found ("Steel Bottle") may belong to someone who lost "Water Bottle" (73%).', NOW() - INTERVAL 2 DAY, FALSE, 3, 1),
('Possible match for your lost "Wired Earphones": a found item "Earphones" looks similar (81%). Open Matches to review.', NOW() - INTERVAL 2 DAY, FALSE, 2, 2),
('The item you found ("Earphones") may belong to someone who lost "Wired Earphones" (81%).', NOW() - INTERVAL 2 DAY, TRUE, 3, 2),
('Your lost item "Brown Leather Wallet" has a confirmed match. Check your matches.', NOW() - INTERVAL 6 DAY, TRUE, 5, 3),
('A lost-item report matching the item you found ("Brown Wallet") was confirmed. The owner may file a claim.', NOW() - INTERVAL 6 DAY, TRUE, 6, 3),
('Your lost item "Hostel Room Keys" has a confirmed match. Check your matches.', NOW() - INTERVAL 1 DAY, FALSE, 3, 4),
('A lost-item report matching the item you found ("Keys with Red Tag") was confirmed. The owner may file a claim.', NOW() - INTERVAL 1 DAY, FALSE, 4, 4),
('Possible match for your lost "Black Backpack": a found item "Black Wildcraft Backpack" looks similar (73%). Open Matches to review.', NOW() - INTERVAL 1 DAY, FALSE, 4, 5),
('The item you found ("Black Wildcraft Backpack") may belong to someone who lost "Black Backpack" (73%).', NOW() - INTERVAL 1 DAY, FALSE, 5, 5),
('Possible match for your lost "Scientific Calculator": a found item "Casio Scientific Calculator" looks similar (80%). Open Matches to review.', NOW() - INTERVAL 2 DAY, TRUE, 1, 6),
('The item you found ("Casio Scientific Calculator") may belong to someone who lost "Scientific Calculator" (80%).', NOW() - INTERVAL 2 DAY, TRUE, 6, 6);

INSERT INTO NOTIFICATION (Message, Date, ReadStatus, StudentID, MatchID) VALUES
('Your claim on "Brown Wallet" was rejected.', NOW() - INTERVAL 5 DAY, TRUE, 2, NULL),
('Your claim on "Brown Wallet" was approved.', NOW() - INTERVAL 5 DAY, TRUE, 5, NULL);
