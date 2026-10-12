# Notes API

A beginner-friendly REST API for creating, listing, reading, updating, and deleting notes. The API uses Express.js and stores notes in MongoDB through Mongoose.

## Prerequisites

- Node.js (LTS recommended) and npm
- A MongoDB server running locally, or a MongoDB Atlas database
- Visual Studio Code (optional, but useful for editing and running the project)

MongoDB is a separate service; installing this project's npm packages does not install or start MongoDB.

## Install and configure

Open this project folder in VS Code. In **Terminal > New Terminal**, run:

```powershell
npm install
```

This installs Express, Mongoose, and dotenv from `package.json`.

The included `.env` is configured for a local MongoDB server and the `notesdb` database:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/notesdb
PORT=3000
```

If `.env` is missing, copy the example before starting:

```powershell
Copy-Item .env.example .env
```

`.env` is excluded from Git. Keep real usernames, passwords, and Atlas connection strings in `.env`; never put credentials in source files or commit `.env`.

### Use MongoDB locally

Install MongoDB Community Server for Windows and make sure its MongoDB service is running. If you installed MongoDB as a Windows service, you can start it from an elevated PowerShell terminal with:

```powershell
Start-Service MongoDB
```

Alternatively, if MongoDB is installed but not running as a service, create a data directory and start the server in a separate terminal:

```powershell
New-Item -ItemType Directory -Force C:\data\db
mongod --dbpath C:\data\db
```

Leave that terminal open while using the API. The database `notesdb` and its collections are created by MongoDB/Mongoose when the first note is saved.

### Use MongoDB Atlas

Create an Atlas cluster, create a database user, and allow your computer's IP address in the project's Network Access settings. In Atlas, select **Connect > Drivers** and copy the connection string. Replace the local `MONGODB_URI` in `.env` with that URI, substituting your database username and password and using `notesdb` as the database name, for example:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/notesdb?retryWrites=true&w=majority
PORT=3000
```

Replace each placeholder with your Atlas values. URL-encode special characters in the password. Do not share or commit the resulting connection string.

## Start the API

With MongoDB running and `.env` configured, start the server from the VS Code terminal:

```powershell
npm start
```

The API listens at `http://localhost:3000`. For automatic restarts while editing, use:

```powershell
npm run dev
```

To check JavaScript syntax without starting the database-backed server, run:

```powershell
npm run check
```

## API reference

All endpoints use the `/api/notes` path and accept/return JSON. In Postman, set the request header `Content-Type` to `application/json` for requests with a body. Notes include `createdAt` and `updatedAt` timestamps.

Successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "..." }`.

### Create a note

`POST http://localhost:3000/api/notes`

Request body:

```json
{
  "title": "My First Note",
  "content": "This is my first note using the Notes API."
}
```

Expected status: `201 Created`.

```json
{
  "success": true,
  "data": {
    "_id": "66f1234567890abcdef12345",
    "title": "My First Note",
    "content": "This is my first note using the Notes API.",
    "createdAt": "2026-10-12T07:15:00.000Z",
    "updatedAt": "2026-10-12T07:15:00.000Z",
    "__v": 0
  }
}
```

The ID and timestamps in this example are illustrative; MongoDB generates the real values. Missing, non-string, or blank title/content values are rejected with `400 Bad Request`.

### Get all notes

`GET http://localhost:3000/api/notes`

Expected status: `200 OK`. Notes are ordered newest first.

```json
{
  "success": true,
  "data": [
    {
      "_id": "66f1234567890abcdef12345",
      "title": "My First Note",
      "content": "This is my first note using the Notes API.",
      "createdAt": "2026-10-12T07:15:00.000Z",
      "updatedAt": "2026-10-12T07:15:00.000Z",
      "__v": 0
    }
  ]
}
```

When no notes exist, `data` is an empty array.

### Get one note

`GET http://localhost:3000/api/notes/<noteId>`

Replace `<noteId>` with the `_id` returned by create or list. Expected status: `200 OK`; the response's `data` contains that note in the same shape as above. An invalid ID returns `400 Bad Request`; a valid ID with no matching note returns `404 Not Found`.

### Update a note

`PUT http://localhost:3000/api/notes/<noteId>`

Request body (update either or both fields):

```json
{
  "title": "Updated Note",
  "content": "The note has been updated."
}
```

Expected status: `200 OK`; `data` contains the saved note, with its `updatedAt` timestamp refreshed. Empty updates and blank/non-string supplied values return `400 Bad Request`. Invalid IDs return `400`; missing notes return `404`.

### Delete a note

`DELETE http://localhost:3000/api/notes/<noteId>`

Expected status: `200 OK`.

```json
{
  "success": true,
  "message": "Note deleted successfully.",
  "data": {
    "_id": "66f1234567890abcdef12345",
    "title": "Updated Note",
    "content": "The note has been updated.",
    "createdAt": "2026-10-12T07:15:00.000Z",
    "updatedAt": "2026-10-12T07:20:00.000Z",
    "__v": 0
  }
}
```

Invalid IDs return `400 Bad Request`; valid IDs for notes that do not exist return `404 Not Found`.

## Test with Postman

1. Start MongoDB (locally or through Atlas) and start the API with `npm start`.
2. In Postman, create a request and choose its method (GET, POST, PUT, or DELETE).
3. Use the corresponding URL and JSON body above. Add `Content-Type: application/json` to POST and PUT requests.
4. Send the POST request first and copy the returned `_id`.
5. Use that ID in the GET-by-ID, PUT, and DELETE URLs. Send GET all at any time to view the current notes.
6. Confirm each HTTP status and JSON response matches the examples.

If the server cannot connect to MongoDB, check that MongoDB is running and that `MONGODB_URI` in `.env` is correct. The server reports startup connection failures in the terminal and does not start listening without a database connection.
