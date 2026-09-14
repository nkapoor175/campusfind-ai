-- ==========================================================================
-- CampusFind AI – Database Schema
-- ==========================================================================
-- Run this script against a fresh MySQL server to set up the database.
-- All tables use InnoDB for foreign-key support and transactional safety.
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS campusfind;
USE campusfind;

-- --------------------------------------------------------------------------
-- Drop tables in reverse-dependency order so FKs don't block the drops
-- --------------------------------------------------------------------------
DROP TABLE IF EXISTS NOTIFICATION;
DROP TABLE IF EXISTS CLAIM;
DROP TABLE IF EXISTS `MATCH`;
DROP TABLE IF EXISTS FOUND_ITEM_IMAGE;
DROP TABLE IF EXISTS LOST_ITEM_IMAGE;
DROP TABLE IF EXISTS FOUND_ITEM;
DROP TABLE IF EXISTS LOST_ITEM;
DROP TABLE IF EXISTS ADMIN;
DROP TABLE IF EXISTS STUDENT;

-- ==========================================================================
-- 1. STUDENT
-- ==========================================================================
CREATE TABLE STUDENT (
    StudentID   INT             AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100)    NOT NULL,
    Email       VARCHAR(100)    NOT NULL UNIQUE,
    Phone       VARCHAR(15)     NOT NULL,
    Department  VARCHAR(100)    NOT NULL,
    Year        INT             NOT NULL,
    Hostel      VARCHAR(50)     NOT NULL,
    Password    VARCHAR(255)    NOT NULL
) ENGINE=InnoDB;

-- ==========================================================================
-- 2. ADMIN
-- ==========================================================================
CREATE TABLE ADMIN (
    AdminID     INT             AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(100)    NOT NULL,
    Email       VARCHAR(100)    NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ==========================================================================
-- 3. LOST_ITEM
-- ==========================================================================
CREATE TABLE LOST_ITEM (
    LostID          INT             AUTO_INCREMENT PRIMARY KEY,
    ItemName        VARCHAR(100)    NOT NULL,
    Category        VARCHAR(50)     NOT NULL,
    Brand           VARCHAR(50)     NULL,
    Color           VARCHAR(30)     NOT NULL,
    Description     TEXT            NOT NULL,
    DateLost        DATE            NOT NULL,
    LostLocation    VARCHAR(150)    NOT NULL,
    Status          ENUM('Open', 'Matched', 'Closed') NOT NULL DEFAULT 'Open',
    StudentID       INT             NOT NULL,
    AdminID         INT             NULL,

    CONSTRAINT fk_lost_student
        FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_lost_admin
        FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================================
-- 4. FOUND_ITEM
-- ==========================================================================
CREATE TABLE FOUND_ITEM (
    FoundID         INT             AUTO_INCREMENT PRIMARY KEY,
    ItemName        VARCHAR(100)    NOT NULL,
    Category        VARCHAR(50)     NOT NULL,
    Brand           VARCHAR(50)     NULL,
    Color           VARCHAR(30)     NOT NULL,
    Description     TEXT            NOT NULL,
    DateFound       DATE            NOT NULL,
    FoundLocation   VARCHAR(150)    NOT NULL,
    Status          ENUM('Open', 'Claimed', 'Returned') NOT NULL DEFAULT 'Open',
    StudentID       INT             NOT NULL,
    AdminID         INT             NULL,

    CONSTRAINT fk_found_student
        FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_found_admin
        FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================================
-- 5. LOST_ITEM_IMAGE
-- ==========================================================================
CREATE TABLE LOST_ITEM_IMAGE (
    LostID      INT             NOT NULL,
    ImageURL    VARCHAR(500)    NOT NULL,

    PRIMARY KEY (LostID, ImageURL),

    CONSTRAINT fk_lostimg_lost
        FOREIGN KEY (LostID) REFERENCES LOST_ITEM(LostID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- 6. FOUND_ITEM_IMAGE
-- ==========================================================================
CREATE TABLE FOUND_ITEM_IMAGE (
    FoundID     INT             NOT NULL,
    ImageURL    VARCHAR(500)    NOT NULL,

    PRIMARY KEY (FoundID, ImageURL),

    CONSTRAINT fk_foundimg_found
        FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- 7. MATCH (backtick-escaped — MATCH is a MySQL reserved word)
-- ==========================================================================
CREATE TABLE `MATCH` (
    MatchID     INT             AUTO_INCREMENT PRIMARY KEY,
    MatchDate   DATETIME        NOT NULL,
    MatchStatus ENUM('Pending', 'Confirmed', 'Rejected') NOT NULL DEFAULT 'Pending',
    MatchScore  DECIMAL(5,2)    NOT NULL,
    LostID      INT             NOT NULL,
    FoundID     INT             NOT NULL,

    CONSTRAINT fk_match_lost
        FOREIGN KEY (LostID) REFERENCES LOST_ITEM(LostID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_match_found
        FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================================
-- 8. CLAIM
-- ==========================================================================
CREATE TABLE CLAIM (
    ClaimID             INT             AUTO_INCREMENT PRIMARY KEY,
    ClaimDate           DATETIME        NOT NULL,
    ClaimStatus         ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    VerificationNotes   TEXT            NULL,
    StudentID           INT             NOT NULL,
    FoundID             INT             NOT NULL,
    AdminID             INT             NULL,

    CONSTRAINT fk_claim_student
        FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_claim_found
        FOREIGN KEY (FoundID) REFERENCES FOUND_ITEM(FoundID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_claim_admin
        FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================================
-- 9. NOTIFICATION
-- ==========================================================================
CREATE TABLE NOTIFICATION (
    NotificationID  INT             AUTO_INCREMENT PRIMARY KEY,
    Message         TEXT            NOT NULL,
    Date            DATETIME        NOT NULL,
    ReadStatus      BOOLEAN         NOT NULL DEFAULT FALSE,
    StudentID       INT             NOT NULL,
    MatchID         INT             NULL,

    CONSTRAINT fk_notif_student
        FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_notif_match
        FOREIGN KEY (MatchID) REFERENCES `MATCH`(MatchID)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;
