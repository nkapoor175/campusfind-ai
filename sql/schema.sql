-- CampusFind AI - DBMS Mini Project
-- MySQL schema (9 tables). Matches finalized ER diagram / relational schema.

CREATE DATABASE IF NOT EXISTS campusfind_ai;
USE campusfind_ai;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS NOTIFICATION;
DROP TABLE IF EXISTS CLAIM;
DROP TABLE IF EXISTS MATCH_RECORD;
DROP TABLE IF EXISTS FOUND_ITEM_IMAGE;
DROP TABLE IF EXISTS FOUND_ITEM;
DROP TABLE IF EXISTS LOST_ITEM_IMAGE;
DROP TABLE IF EXISTS LOST_ITEM;
DROP TABLE IF EXISTS ADMIN;
DROP TABLE IF EXISTS STUDENT;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. STUDENT
CREATE TABLE STUDENT (
    StudentID   INT AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(150) NOT NULL UNIQUE,
    Phone       VARCHAR(20),
    Department  VARCHAR(100),
    Year        INT,
    Hostel      VARCHAR(100),
    Password    VARCHAR(255) NOT NULL
);

-- 2. ADMIN
CREATE TABLE ADMIN (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Name    VARCHAR(100) NOT NULL,
    Email   VARCHAR(150) NOT NULL UNIQUE
);

-- 3. LOST_ITEM
CREATE TABLE LOST_ITEM (
    LostID       INT AUTO_INCREMENT PRIMARY KEY,
    ItemName     VARCHAR(150) NOT NULL,
    Category     VARCHAR(100),
    Brand        VARCHAR(100),
    Color        VARCHAR(50),
    Description  TEXT,
    DateLost     DATE,
    LostLocation VARCHAR(150),
    Status       ENUM('Open','Matched','Closed') NOT NULL DEFAULT 'Open',
    StudentID    INT NOT NULL,
    AdminID      INT,
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
);

-- 4. LOST_ITEM_IMAGE (resolves multivalued ImageURL attribute)
CREATE TABLE LOST_ITEM_IMAGE (
    LostID   INT NOT NULL,
    ImageURL VARCHAR(500) NOT NULL,
    PRIMARY KEY (LostID, ImageURL),
    FOREIGN KEY (LostID) REFERENCES LOST_ITEM(LostID) ON DELETE CASCADE
);

-- 5. FOUND_ITEM (mirror of LOST_ITEM)
CREATE TABLE FOUND_ITEM (
    FoundID       INT AUTO_INCREMENT PRIMARY KEY,
    ItemName      VARCHAR(150) NOT NULL,
    Category      VARCHAR(100),
    Brand         VARCHAR(100),
    Color         VARCHAR(50),
    Description   TEXT,
    DateFound     DATE,
    FoundLocation VARCHAR(150),
    Status        ENUM('Open','Claimed','Returned') NOT NULL DEFAULT 'Open',
    StudentID     INT NOT NULL,
    AdminID       INT,
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
);

-- 6. FOUND_ITEM_IMAGE
CREATE TABLE FOUND_ITEM_IMAGE (
    FoundID  INT NOT NULL,
    ImageURL VARCHAR(500) NOT NULL,
    PRIMARY KEY (FoundID, ImageURL),
    FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID) ON DELETE CASCADE
);

-- 7. MATCH_RECORD (named to avoid MATCH reserved word; no stored MatchScore - derived at query time by AI service)
CREATE TABLE MATCH_RECORD (
    MatchID     INT AUTO_INCREMENT PRIMARY KEY,
    MatchDate   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MatchStatus ENUM('Pending','Confirmed','Rejected') NOT NULL DEFAULT 'Pending',
    LostID      INT NOT NULL,
    FoundID     INT NOT NULL,
    FOREIGN KEY (LostID) REFERENCES LOST_ITEM(LostID),
    FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID)
);

-- 8. CLAIM (promoted from M:N to entity - needs own attributes + referenceable ID)
CREATE TABLE CLAIM (
    ClaimID           INT AUTO_INCREMENT PRIMARY KEY,
    ClaimDate         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ClaimStatus       ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
    VerificationNotes TEXT,
    StudentID         INT NOT NULL,
    FoundID           INT NOT NULL,
    AdminID           INT,
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),
    FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID),
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
);

-- 9. NOTIFICATION
CREATE TABLE NOTIFICATION (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    Message        VARCHAR(500) NOT NULL,
    Date           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ReadStatus     BOOLEAN NOT NULL DEFAULT FALSE,
    StudentID      INT NOT NULL,
    MatchID        INT,
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),
    FOREIGN KEY (MatchID) REFERENCES MATCH_RECORD(MatchID)
);
