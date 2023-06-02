-- DROP TABLE IF EXISTS notifications;
-- CREATE TABLE notifications (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     remoteId VARCHAR NOT NULL UNIQUE,
--     did VARCHAR NOT NULL,
--     title VARCHAR NOT NULL,
--     subtitle VARCHAR NULL,
--     message TEXT NOT NULL,
--     image TEXT NULL,
--     type VARCHAR NULL,
--     status VARCHAR NOT NULL,
--     expireAt DATETIME NULL,
--     version INTEGER NOT NULL,
--     network VARCHAR NOT NULL,
--     ticket TEXT NULL,
--     receipt TEXT NULL,
--     error TEXT NULL,
--     sentAt DATETIME NULL,
--     createdAt DATETIME NOT NULL,
--     updatedAt DATETIME NOT NULL
-- );

-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     did VARCHAR NOT NULL UNIQUE,
--     token VARCHAR NOT NULL,
--     network VARCHAR NOT NULL,
--     status VARCHAR NOT NULL,
--     version VARCHAR NULL,
--     createdAt DATETIME NOT NULL,
--     updatedAt DATETIME NOT NULL
-- )

ALTER TABLE notifications
ADD COLUMN link TEXT NULL;
ALTER TABLE notifications
ADD COLUMN linkLabel VARCHAR NULL;
ALTER TABLE notifications
ADD COLUMN read TINYINT NOT NULL DEFAULT 0;