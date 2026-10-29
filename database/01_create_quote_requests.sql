-- Northline Job Manager: QuoteRequests table + SAMPLE seed data
-- Fictional business and customers, for a portfolio project.
-- Warning: re-running this script drops the table and recreates it.

DROP TABLE IF EXISTS dbo.QuoteRequests;
GO

CREATE TABLE dbo.QuoteRequests (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName  NVARCHAR(100)  NOT NULL,
    Email         NVARCHAR(255)  NULL,
    Phone         NVARCHAR(30)   NULL,
    Address       NVARCHAR(200)  NOT NULL,
    ServiceType   NVARCHAR(30)   NOT NULL,
    PropertyType  NVARCHAR(20)   NOT NULL,
    Season        NVARCHAR(10)   NOT NULL,
    Status        NVARCHAR(20)   NOT NULL CONSTRAINT DF_QuoteRequests_Status DEFAULT 'New',
    ScheduledDate DATE           NULL,
    Notes         NVARCHAR(1000) NULL,
    CreatedAt     DATETIME2      NOT NULL CONSTRAINT DF_QuoteRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2      NULL,

    CONSTRAINT CK_QuoteRequests_Service  CHECK (ServiceType  IN ('Landscaping','Snow Removal','Lawn Care','Yard Cleanup')),
    CONSTRAINT CK_QuoteRequests_Property CHECK (PropertyType IN ('Residential','Commercial')),
    CONSTRAINT CK_QuoteRequests_Season   CHECK (Season       IN ('Spring','Summer','Fall','Winter')),
    CONSTRAINT CK_QuoteRequests_Status   CHECK (Status       IN ('New','Quoted','Scheduled','Completed')),
    CONSTRAINT CK_QuoteRequests_Contact  CHECK (Email IS NOT NULL OR Phone IS NOT NULL),
    CONSTRAINT CK_QuoteRequests_Schedule CHECK (Status NOT IN ('Scheduled','Completed') OR ScheduledDate IS NOT NULL)
);
GO

CREATE INDEX IX_QuoteRequests_Status ON dbo.QuoteRequests (Status);
GO

-- SAMPLE DATA (made up)
INSERT INTO dbo.QuoteRequests
    (CustomerName, Email, Phone, Address, ServiceType, PropertyType, Season, Status, ScheduledDate, Notes, CreatedAt)
VALUES
 ('Sample Customer A', 'a@example.com', '780-555-0101', '101 Sample St NW, Edmonton', 'Snow Removal', 'Residential', 'Winter', 'New',       NULL,         'Driveway and front walk',        '2026-10-20'),
 ('Sample Customer B', NULL,            '780-555-0102', '202 Example Ave SW, Edmonton', 'Landscaping', 'Residential', 'Spring', 'Quoted',    NULL,         'Backyard sod and new garden bed','2026-10-18'),
 ('Sample Co. Ltd.',   'ops@example.com', NULL,         '303 Demo Rd NW, Edmonton',  'Snow Removal', 'Commercial',  'Winter', 'Scheduled', '2026-11-15', 'Parking lot, 40 stalls',          '2026-10-15'),
 ('Sample Customer C', 'c@example.com', NULL,           '404 Test Cres, St. Albert', 'Yard Cleanup', 'Residential', 'Fall',   'Completed', '2026-10-10', 'Leaf removal',                    '2026-10-02'),
 ('Sample Customer D', 'd@example.com', '780-555-0104', '505 Mock Blvd NW, Edmonton','Lawn Care',    'Residential', 'Summer', 'New',       NULL,         'Weekly mowing next summer',       '2026-10-22'),
 ('Sample Plaza Inc.', 'mgr@example.com','780-555-0105','606 Placeholder Way, Edmonton','Landscaping','Commercial', 'Spring', 'Quoted',    NULL,         'Front entrance planters',         '2026-10-12'),
 ('Sample Customer E', NULL,            '780-555-0106', '707 Sample Dr, Sherwood Park','Snow Removal','Residential','Winter', 'Scheduled', '2026-11-20', 'Seasonal contract',               '2026-10-19'),
 ('Sample Customer F', 'f@example.com', NULL,           '808 Example St NW, Edmonton','Yard Cleanup','Residential', 'Fall',   'Completed', '2026-10-08', NULL,                              '2026-09-28'),
 ('Sample Customer G', 'g@example.com', '780-555-0108', '909 Demo Ave SW, Edmonton', 'Landscaping', 'Residential', 'Spring', 'New',       NULL,         'Retaining wall estimate',         '2026-10-25'),
 ('Sample Storage Co.','info@example.com',NULL,         '111 Test Rd, Edmonton',     'Snow Removal', 'Commercial',  'Winter', 'Quoted',    NULL,         'Loading dock and lot',            '2026-10-21');
GO

-- Check: counts by status
SELECT Status, COUNT(*) AS Requests
FROM dbo.QuoteRequests
GROUP BY Status;