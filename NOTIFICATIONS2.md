# Notifications V2

## GET /v2/notifications/templates

### Overview

The `/v2/notifications/templates` endpoint retrieves notification templates from the database. It supports an optional query parameter to control the scope of the returned data.

### Query Parameters

- `dump` (optional): A boolean flag that determines the scope of the data fetched. When true, all notification templates are returned regardless of their status. If absent or false, only active templates are returned.

### Response Format

The endpoint responds with a JSON object structured as follows:

```JSON
{
  "success": boolean,
  "data": string | NotificationTemplate[]
}
```

**Successful Response**

- success: true
- data: An array of NotificationTemplate objects, representing the notification templates fetched from the database.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## GET /v2/notifications/templates/:id

### Overview

The `/v2/notifications/templates/:id` endpoint retrieves a specific notification template from the database using its unique identifier. This allows for fetching detailed information about a single template.

### Path Parameters

- `id` (required): The unique identifier of the notification template. Must be a valid integer representing the template's ID in the database.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": NotificationTemplate | string
}
```

**Successful Response**

- success: true
- data: A NotificationTemplate object representing the notification template fetched from the database.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing. Common errors include invalid template ID or database access issues.
-

## POST /v2/notifications/templates

### Overview

The `/v2/notifications/templates` endpoint is used to create or update a notification template in the database. This endpoint handles both insertion and update logic based on the presence of a template ID.

### Request Body

- `id` (optional for creation, required for update): The unique identifier of the notification template. It must be a number.
- `networks` (required): An array of network identifiers where the notification will be used, such as `mainnet`, `testnet`, or `devnet`.
- `title` (required): The title of the notification template.
- `subtitle` (optional): The subtitle of the notification template.
- `message` (required): The message content of the notification template.
- `image` (optional): A URL or a reference to the image associated with the notification template.
- `linkTemplate` (optional): The URL template that will be used to generate the link in the notification.
- `linkLabel` (optional): The label for the link in the notification.
- `type` (required): The type of the notification template.
- `expireAt` (optional): The expiration date of the notification template.
- `status` (optional): The status of the notification template, defaulting to `inactive`.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": NotificationTemplate | string
}
```

**Successful Response**

- success: true
- data: A NotificationTemplate object representing the newly created or updated notification template in the database.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## GET /v2/notifications

### Overview

The `/v2/notifications` endpoint retrieves notifications from the database. It supports optional query parameters to control the scope and filtering of the returned data.

### Query Parameters

- `dump` (optional): A boolean flag that, when true, returns all notifications in the database. If absent or false, only active notifications are returned.
- `network` (optional): A filter to return notifications belonging to a specific network, such as `mainnet`, `testnet`, or `devnet`. If specified, only notifications from the given network are returned.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification[] | string
}
```

**Successful Response**

- success: true
- data: An array of notification objects representing the notifications fetched from the database.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## GET /v2/notifications/id/:id

### Overview

The `/v2/notifications/id/:id` endpoint retrieves a specific notification by its ID, along with associated template and user details. This endpoint is designed to fetch detailed information about a single notification.

### Path Parameters

- `id` (required): The unique identifier of the notification to fetch. Must be a valid integer representing the notification's ID in the database.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification | string
}
```

**Successful Response**

- success: true
- data: An object containing the detailed information of the notification.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## GET /v2/notifications/:network/:did

### Overview

The `/v2/notifications/:network/:did` endpoint retrieves notifications for a specific user (identified by `did`) within a given network. It allows for filtering notifications based on their expiration and status.

### Path Parameters

- `network` (required): The network identifier (e.g., `mainnet`, `testnet`, `devnet`) to which the notifications belong.
- `did` (required): The decentralized identifier (DID) of the user for whom notifications are being fetched.

### Query Parameters

- `date` (optional): The reference date for filtering notifications. Notifications with an expiration date later than this date are returned. If not provided, the current date is used.
- `dump` (optional): A boolean flag that, when true, returns all notifications for the user and network, regardless of their status. If false or omitted, only active notifications are returned.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification | string
}
```

**Successful Response**

- success: true
- data: An array of notification objects representing the notifications fetched from the database for the specified user and network.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## POST /v2/notifications/:network/:did

### Overview

The `/v2/notifications/:network/:did` endpoint is used to create or update a notification in the database, with additional logic to handle notification status and delivery based on user and template data.

### Path Parameters

- `network` (required): The network identifier (such as `mainnet`, `testnet`, or `devnet`) associated with the notification.
- `did` (required): The decentralized identifier (DID) representing the user to whom the notification will be sent.

### Request Body

- `id` (required): The unique identifier for the notification. It must be a number.
- `template` (required): The ID of the notification template to be used.
- `link` (optional): A URL associated with the notification.
- `expireAt` (optional): The expiration date and time for the notification.
- `status` (required): The status of the notification (e.g., `active`, `draft`, `expired`). This value will be overwritten if the template expired or isn't active of if the user's push token is older than 7 days.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Ticket | string
}
```

**Successful Response**

- success: true
- data: An object containing the ticket information for the sent notification.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## GET /v2/notifications/receipts

### Overview

The `/v2/notifications/receipts` endpoint fetches the receipts for notifications that have been sent but have not yet had their receipt status updated in the database. This process involves checking the delivery status of notifications via the Expo push notification service.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification[] | string
}
```

**Successful Response**

- success: true
- data: An array of notification objects, each with updated receipt information indicating the delivery status.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## PATCH /v2/notifications/status/:id

### Overview

The `/v2/notifications/status/:id` endpoint updates the status of a specific notification identified by its ID. This endpoint only updates notifications that have not yet been sent (where `ticket` is `NULL`).

### Path Parameters

- `id` (required): The unique identifier of the notification whose status is to be updated. It must be a valid integer representing the notification's ID in the database.

### Request Body

- `status` (required): The new status to be set for the notification. This must be a valid status string.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification | string
}
```

**Successful Response**

- success: true
- data: The Notification object with the updated status.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.

## DELETE /v2/notifications/:deleteId

### Overview

The `/v2/notifications/:deleteId` endpoint marks a specific notification as deleted in the database by updating its status to 'deleted'. This action does not physically remove the notification record but instead changes its status to reflect that it is no longer active.

### Path Parameters

- `deleteId` (required): The unique identifier of the notification to be marked as deleted. It must be a valid integer representing the notification's ID in the database.

### Response Format

The endpoint responds with a JSON object structured as follows:

```json
{
  "success": boolean,
  "data": Notification | string
}
```

**Successful Response**

- success: true
- data: The Notification object with the status updated to 'deleted'.

**Error Response**

- success: false
- data: A string describing the error encountered during the request processing.
