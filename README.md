# bitabase - Manager
[![Build Status](https://travis-ci.org/bitabase/bitabase-manager.svg?branch=master)](https://travis-ci.org/bitabase/bitabase-manager)
[![David DM](https://david-dm.org/bitabase/bitabase-manager.svg)](https://david-dm.org/bitabase/bitabase-manager)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bitabase/bitabase-manager)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/bitabase/bitabase-manager)](https://github.com/bitabase/bitabase-manager/blob/master/package.json)
[![GitHub](https://img.shields.io/github/license/bitabase/bitabase-manager)](https://github.com/bitabase/bitabase-manager/blob/master/LICENSE)

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
This project is licensed under the terms of the AGPL-3.0 license.
