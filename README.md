# ixo-notifications-worker

This is a minimal project for creating, storing and serving notifications using Cloudflare Workers.

## Development

Read more about development a [DEVELOP.md](./DEVELOP.md)

## Endpoints

> **Notice:** Notifications V2 is now available. Read through the [docs](./NOTIFICATIONS2.md).

- GET `/`

### users (v1)

- GET `/users`

- GET `/users/:did`

- POST `/users`

  ```json
  {
  	"did": "string",
  	"token": "string",
  	"network": "string",
  	"status": "string"
  }
  ```

- PUT `/users/:did`

  ```json
  {
  	"token": "string",
  	"network": "string",
  	"status": "string"
  }
  ```

- DELETE `/users/:did`

### notifications (v1)

- GET `/notifications`

- GET `/notifications/did/:did?date`

  - date (optional): `YYYY-MM-DD hh:mm:ss`

- GET `/notifications/id/:id`

- POST `/notifications/:did`

  ```json
  {
  	"title": "string",
  	"message": "string",
  	"status": "string",
  	"expireAt": "string",
  	"type": "string"
  }
  ```

- GET `/notifications/receipts`

- PATCH `/notifications/status/:id`

  ```json
  {
  	"status": "string"
  }
  ```

- DELETE `/notifications/:id`

## License

MIT
