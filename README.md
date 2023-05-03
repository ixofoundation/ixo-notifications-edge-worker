# ixo-notifications-worker

This is a minimal project for storing and serving and creating notifications data using Cloudflare Workers.

## Features

- Minimal
- TypeScript
- Wrangler to develop and deploy.

## Usage

### Install

```
yarn install
```

### Develop

```
yarn dev
```

### Test

```
yarn test
```

### Deploy

```
yarn deploy
```

### Create Database

Create a D1 database called `notifications`

```
npx wrangler d1 create notifications
```

### Env vars and schema

Set the environment variables in [wrangler.toml](wrangler.toml)

Apply the [schema file](/schemas/schema.sql)

```
npx wrangler d1 execute notifications --file schemas/schema.sql
```

## Routes

### users (v1)

- GET `/users`

- GET `/users/:did`

- POST `/users`

  ```json
  {
  	"did": "string",
  	"token": "string",
  	"network": "string"
  }
  ```

- PUT `/users/:did`

  ```json
  {
  	"token": "string",
  	"network": "string"
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

- PATCH `/notifications/status/:id`

  ```json
  {
  	"status": "string"
  }
  ```

- DELETE `/notifications/:id`

## License

MIT
