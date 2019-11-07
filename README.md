# bitabase - Manager
[![Build Status](https://travis-ci.org/bitabase/bitabase-server.svg?branch=master)](https://travis-ci.org/bitabase/bitabase-server)
[![David DM](https://david-dm.org/bitabase/bitabase-server.svg)](https://david-dm.org/bitabase/bitabase-server)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bitabase/bitabase-server)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/bitabase/bitabase-server)](https://github.com/bitabase/bitabase-server/blob/master/package.json)
[![GitHub](https://img.shields.io/github/license/bitabase/bitabase-server)](https://github.com/bitabase/bitabase-server/blob/master/LICENSE)

This is a very early attempt at an accounts management service.

## Endpoints
### Create a user
> POST /users

```json
{
  "email": "test@example.com",
  "password": "testpassword"
}
```

### Create a session
> POST /sessions

```json
{
  "email": "test@example.com",
  "password": "testpassword"
}
```

### Create a database
> POST /database

```json
{
  "name": "example",
}
```

### Assign a user to a database
> POST /database/users

```json
{
  "email": "test@example.com"
}
```

### Create a collection
> POST /database/:databaseName/collections

```json
{
  "id": "test",
  "schema": {
    "test": ["required", "string"]
  },
  "mutations": [
    "data.test = concat(data.test, '-changed')"
  ]
}
```

## License
This project is licensed under the terms of the AGPL license.
