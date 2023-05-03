DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR NOT NULL,
    createdAT DATETIME NOT NULL,
    expireAt DATETIME NOT NULL,
    did VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    ticket TEXT NULL,
    receipt TEXT NULL,
    error TEXT NULL
);

-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     did VARCHAR NOT NULL UNIQUE,
--     token VARCHAR NOT NULL,
--     network VARCHAR NOT NULL,
--     updatedAt DATETIME NOT NULL
-- )