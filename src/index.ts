import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { cors } from "hono/cors";

interface Env {
    AUTHORIZATION: string;
    Notifications: D1Database;
}

interface Notification {
    message: string;
    status: string;
    expires: string;
    did: string;
    type: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", poweredBy());
app.use("*", cors());
app.use("*", async (c, next) => {
    if (c.req.header("Authorization") === c.env.AUTHORIZATION) {
        await next();
    } else {
        return c.text("Authorization Failed");
    }
});

app.get("/", (c) => {
    return c.text("Hello IXO!");
});

app.post("/createNotification", async (c) => {
    try {
        const body: Notification = await c.req.json();
        const result = await c.env.Notifications.prepare(
            `
        INSERT INTO notifications (message, status, expires, did, type) values (?, ?, ?, ?, ?)`,
        )
            .bind(body.message, body.status, body.expires, body.did, body.type)
            .all();
        return c.json(result);
    } catch (error) {
        return c.text(error);
    }
});

app.post("/storeNotificationsAirtable", async (c) => {
    try {
        const body: Notification = await c.req.json();
        const result = await c.env.Notifications.prepare(
            `
        INSERT INTO notifications (message, status, expires, did, type) values (?, ?, ?, ?, ?)`,
        )
            .bind(body.message, body.status, body.expires, body.did, body.type)
            .all();
        return c.json(result);
    } catch (error) {
        return c.text(error);
    }
});

app.get("/updateNotification/:id/:status", async (c) => {
    try {
        const id = c.req.param("id");
        const status = c.req.param("status");
        const result = await c.env.Notifications.prepare(
            `UPDATE notifications SET status = ? WHERE id = ?`,
        )
            .bind(status, +id)
            .all();
        return c.json(result);
    } catch (error) {
        return c.text(error);
    }
});

app.get("/getNotification/:did", async (c) => {
    try {
        const did = c.req.param("did");
        const result = await c.env.Notifications.prepare(
            `
        SELECT * FROM notifications WHERE did = ?`,
        )
            .bind(did)
            .all();
        return c.json(result);
    } catch (error) {
        return c.text(error);
    }
});

export default app;
