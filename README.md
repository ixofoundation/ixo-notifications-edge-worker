# ixo-notifications-worker

This is a minimal project for storing and serving and creating notifications data using Cloudflare Workers.

## Features

-   Minimal
-   TypeScript
-   Wrangler to develop and deploy.

## Usage

Install

```
yarn install
```

Develop

```
yarn dev
```

Test

```
yarn test
```

Deploy

```
yarn deploy
```

Set the environment variables in [wrangler.toml](wrangler.toml)

Create a D1 database called `notifications` and apply the [schema file](/schemas/schema.sql)

```
wrangler d1 execute notifications --file schemas/schema.sql
```

## Routes

-   POST `/createNotification`

    ```
    {
        "message": "string",
        "status": "string",
        "expires": "string",
        "did": "string",
        "type": "string"
    }
    ```

-   GET `/updateNotification/:id/:status`

-   GET `/getNotification/:did`

## Author

Andrew Margetts <https://github.com/demondayza>

## License

MIT
