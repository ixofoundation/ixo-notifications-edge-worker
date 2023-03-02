DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id integer PRIMARY KEY AUTOINCREMENT,
    message text NOT NULL,
    status text NOT NULL,
    expires text NOT NULL,
    did text NOT NULL,
    type text NOT NULL
);