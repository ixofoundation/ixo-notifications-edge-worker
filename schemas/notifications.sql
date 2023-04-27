DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    status TEXT NOT NULL,
    expires TEXT NOT NULL,
    did TEXT NOT NULL,
    type TEXT NOT NULL
);