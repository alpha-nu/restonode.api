# restonode.api

***for design overview and documentation please review [restonode.ideation repo](https://github.com/alpha-nu/restonode.ideation)***

## environment variables

`dotenv` is used to persist configuration variables, especially sensitive ones such as usernames and password, into a separate .env file.

the provided `.env.example` includes:

```
DATABASE=
DB_USER_NAME=
DB_USER_PASSWORD=
GOOGLE_API_KEY=
```
***The included Google API key in .env.example file can be used***

To use, **rename or copy** `.env.example` to `.env` and fill in the desired values.

## database setup

A seed data script is provided to create the schema and populate some seed data into the tables. 

However the script does not create the actual database base itself, i.e. it is assumed that the latter will be created manually. Ex. if using mysql or postgresql, execute:

```SQL
CREATE DATABASE `restonode`
```

The ORM implementation here uses mysql. There is a known issue with nodejs driver that may give errors when the driver attempts to login to the database. This is a know workaround, simply change the login type of the user with privileges to perform database operations on the `restonode` database.

```SQL
CREATE USER '<USER_NAME>' IDENTIFIED WITH mysql_native_password BY '<PASSWORD>';
```

Once an empty database is created, the following script can be run to create the schema load the sample data.

```shell
yarn seed-data
```
## running the app
First make sure the code compiles and unit test run with no errors.
```shell
yarn install
yarn test-with-coverage
```

***please make sure all downstream services (i.e. RabbitMQ and MySql) are up or the server will shutdown with a `Downstream System Error`. It is a design choice to ensure a more robust api***

To create the schema only without the seed data, set the `synchronize` option to true in the `ormconfig.json`:
```JSON
 "synchronize": true
```
which will also synchronize the ORM model with the database each time the express app starts.

To start the service on the default node port:
```SHELL
yarn start
```

**For convenience, a postman collection is included in the source, the json export `.\order-management.postman_collection.json` contains sample requests for all endpoints as well as user journeys spanning multiple requests. HTTP errors and entity validations have a dedicated folder in the collection as well.**

For easy testing please run `yarn seed-data` first to be able to get the users accounts used in the collection.

##running the notification consumers
For a full end to end working example, make sure the customer and restaurant notification consumers are running. For more details refer to [restonode.messaging documentation](https://github.com/alpha-nu/restonode.messaging)