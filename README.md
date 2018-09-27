# restonode.api

***for design overview and documentation please review [restonode.ideation repo](https://github.com/alpha-nu/restonode.ideation)***

## environment variables

`dotenv` is used to persist configuration variables, especially sensitive ones such as usernames and password, into a separate .env file.

the provided `.env.example` includes:

```
DATABASE=
DB_USER_NAME=
DB_USER_PASSWORD=
```
To use, **rename or copy** `.env.example` to `.env` and fill in the desired values.

## database setup

A seed data script is provided to create the schema and populate some seed data into the tables. 

However the script does not create the actual database base itself, i.e. it is assumed that the latter will be created manually. Ex. if using mysql or postgresql, execute:

```SQL
CREATE DATABASE `restonode`
```

The ORM implementation here uses mysql. There is a known issue with nodejs driver that may give errors when the driver attempts to login to the database. This is a know workaround, simply change the login type of the user with privileges to ferform database operations on the `restonode` database.

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

Optionally:
```shell
yarn seed-data
```
To start the service on the default node port:
```SHELL
yarn run
```