-- CampusFind AI - demo seed data for local testing
-- Passwords here are plain placeholder strings, NOT bcrypt hashes.
-- Real accounts always go through the /api/students/register endpoint, which bcrypt-hashes on the way in.

USE campusfind_ai;

INSERT INTO STUDENT (Name, Email, Phone, Department, Year, Hostel, Password) VALUES
('Navika Kapoor', 'navika@campus.edu', '9876543210', 'Computer Science', 3, 'Hostel A', 'placeholder_not_a_real_hash'),
('Parthvi Sharma', 'parthvi@campus.edu', '9876543211', 'Computer Science', 3, 'Hostel B', 'placeholder_not_a_real_hash'),
('Rohan Mehta', 'rohan@campus.edu', '9876543212', 'Electronics', 2, 'Hostel C', 'placeholder_not_a_real_hash');

INSERT INTO ADMIN (Name, Email) VALUES
('Campus Security Admin', 'admin@campus.edu');

INSERT INTO LOST_ITEM (ItemName, Category, Brand, Color, Description, DateLost, LostLocation, StudentID) VALUES
('Water Bottle', 'Accessories', 'Milton', 'Blue', 'Steel water bottle with a dented cap, has a college sticker on it', '2026-09-10', 'Library', 1),
('Wired Earphones', 'Electronics', 'boAt', 'Black', 'Black wired earphones in a small pouch', '2026-09-12', 'Canteen', 2);

INSERT INTO LOST_ITEM_IMAGE (LostID, ImageURL) VALUES
(1, 'https://example.com/images/lost/bottle1.jpg'),
(2, 'https://example.com/images/lost/earphones1.jpg');

INSERT INTO FOUND_ITEM (ItemName, Category, Brand, Color, Description, DateFound, FoundLocation, StudentID) VALUES
('Steel Bottle', 'Accessories', 'Milton', 'Blue', 'Found a blue steel bottle near the reading hall entrance', '2026-09-11', 'Library Entrance', 3),
('Earphones', 'Electronics', 'boAt', 'Black', 'Picked up black wired earphones near the canteen tables', '2026-09-12', 'Canteen', 3);

INSERT INTO FOUND_ITEM_IMAGE (FoundID, ImageURL) VALUES
(1, 'https://example.com/images/found/bottle1.jpg'),
(2, 'https://example.com/images/found/earphones1.jpg');

INSERT INTO MATCH_RECORD (MatchStatus, LostID, FoundID) VALUES
('Pending', 1, 1),
('Pending', 2, 2);
