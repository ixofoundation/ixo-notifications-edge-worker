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

Create a D1 database called `users`

```
npx wrangler d1 create users
```

### Env vars and schema

Set the environment variables in [wrangler.toml](wrangler.toml)

Apply the [notifications schema file](/schemas/notifications.sql)

```
npx wrangler d1 execute notifications --file schemas/notifications.sql
```

Apply the [users schema file](/schemas/users.sql)

```
npx wrangler d1 execute users --file schemas/users.sql
```

## Routes

- GET `/getUser/:did`

- POST `/addUser`

  ```json
  {
  	"did": "string",
  	"token": "string"
  }
  ```

- POST `/updateUser`

  ```json
  {
  	"did": "string",
  	"token": "string"
  }
  ```

- POST `/addOrUpdateUser`

  ```json
  {
  	"did": "string",
  	"token": "string"
  }
  ```

- POST `/createNotification`

  ```json
  {
  	"message": "string",
  	"status": "string",
  	"expires": "string",
  	"did": "string",
  	"type": "string"
  }
  ```

- POST `/storeNotificationsAirtable`

  ```json
  {
  	"message": "string",
  	"status": "string",
  	"expires": "string",
  	"did": "string",
  	"type": "string"
  }
  ```

- GET `/updateNotification/:id/:status`

- GET `/getNotification/:did`

## License

MIT
