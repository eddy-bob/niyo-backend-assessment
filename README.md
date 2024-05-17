## Installation

```bash
$ npm install
```

## Setting up the app

Create a .env file in the root of your app and copy the entire content in the .env.example into the newly created .env file.

Ensure you already have Mysql installed and running on your local machine .

Head to your mysql workbench,table plus xampp or any mysql client and create a database instance using the info below

database_name: TYPEORM_DATABASE

note!!
TYPEORM_DATABASE is a variable in your env file. replace it with the original value in your env.
Migration files have already been generated so you do not need to generate migration files.
Migrations are run automatically on every app start

## Migrations

### Generating Migrations

Migrations are not manually written, instead we leverage typeorm's migration generator which checks the state of our database and generates a migration file to cover all changes made to the entities within the source code.

```

$ npm run typeorm migration:generate ./src/database/migrations/<NameOfMigration>

```

### Running Migrations

To run migrations simply run

```

$ npm run migration:run

```

## Running the app

Type the following commands to run the app after following all the previous steps.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Connecting to the websocket

The websocket (socket.io) runs on the port 80.
The socket server emits and listens for three events:

CREATE_TASK: this is the event which the server listens for to create a new task . The server also emits back to the client on this event with the newly created task info. This event expects a payload containing the createTaskDto object.

Note!! that for this event to work, you need to pass a header object containing { authorization'bearer token'} object data to the socket event which will be retrieved as hanshakes. The token is your access token returned on a successful login.
This event is also limited to clients with admin access.

CREATE_TASK_ERROR:The server emits this event with the error information to the client when a create task fails.

SOCKET_CONNECT: The server listens on this event and emits to the client on the same event when a successful connection has been made.
