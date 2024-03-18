-- DROP TABLE IF EXISTS notifications;
-- CREATE TABLE notifications (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     title VARCHAR NOT NULL,
--     message TEXT NOT NULL,
--     status VARCHAR NOT NULL,
--     createdAT DATETIME NOT NULL,
--     expireAt DATETIME NOT NULL,
--     did VARCHAR NOT NULL,
--     type VARCHAR NOT NULL,
--     ticket TEXT NULL,
--     receipt TEXT NULL,
--     error TEXT NULL
-- );

-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     did VARCHAR NOT NULL UNIQUE,
--     token VARCHAR NOT NULL,
--     status VARCHAR NOT NULL,
--     network VARCHAR NOT NULL,
--     updatedAt DATETIME NOT NULL
-- )

DROP TABLE IF EXISTS notification_templates;
CREATE TABLE notification_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    networks VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    subtitle VARCHAR NULL,
    message TEXT NOT NULL,
    image TEXT NULL,
    linkTemplate TEXT NULL,
    linkLabel VARCHAR NULL,
    type VARCHAR NOT NULL,
    expireAt DATETIME NULL,
    status VARCHAR NOT NULL,
    createdAt DATETIME NOT NULL
);

DROP TABLE IF EXISTS notifications_v2;
CREATE TABLE notifications_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template INTEGER NOT NULL,
    user INTEGER NOT NULL,
    link TEXT NULL,
    expireAt DATETIME NULL,
    status VARCHAR NULL,
    createdAt DATETIME NOT NULL,
    ticket TEXT NULL,
    receipt TEXT NULL,
    error TEXT NULL
);