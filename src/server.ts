#!/usr/bin/env node
import 'reflect-metadata';
import Debug from 'debug';
const debug = Debug('restonode.api');
import http from 'http';
import app from './app';
import { createConnection, getRepository, getConnectionOptions } from 'typeorm';
import { Restaurant } from './entity/restaurant';
import { Customer } from './entity/customer';
import { Rating } from './entity/rating';
import { Meal } from './entity/meal';
import * as dotenv from 'dotenv';
import { Order } from './entity/order';
import { DistanceMatrixService } from './services/distanceMatrix';
import orderNotification from './messagin/channel';

dotenv.config();

const loadTypeOrmOptions = async () => await getConnectionOptions();

loadTypeOrmOptions()
    .then(async _ => {

        const localOptions = {
            database: process.env.DATABASE,
            username: process.env.DB_USER_NAME,
            password: process.env.DB_USER_PASSWORD,
        };

        await createConnection(Object.assign(localOptions, _));
    })
    .then(async () => {

        const appInstance = app(
            await getRepository(Restaurant),
            await getRepository(Customer),
            await getRepository(Rating),
            await getRepository(Meal),
            await getRepository(Order),
            new DistanceMatrixService(),
            await orderNotification()
        );

        /**
         * Get port from environment and store in Express.
         */
        const port = normalizePort(process.env.RESTONODE_API_PORT || '3000');
        appInstance.set('port', port);

        /**
         *
         * Create HTTP server.
         */

        const server = http.createServer(appInstance);

        /**
         * Listen on provided port, on all network interfaces.
         */

        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        /**
         * Normalize a port into a number, string, or false.
         */

        function normalizePort(val: string) {
            const parsedPort = parseInt(val, 10);

            if (isNaN(parsedPort)) {
                // named pipe
                return val;
            }

            if (parsedPort >= 0) {
                // port number
                return parsedPort;
            }

            return false;
        }

        /**
         * Event listener for HTTP server "error" event.
         */
        function onError(error: any) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            const bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    // tslint:disable-next-line:no-console
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    // tslint:disable-next-line:no-console
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        /**
         * Event listener for HTTP server "listening" event.
         */

        function onListening() {
            const addr = server.address();
            const bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            debug('Listening on ' + bind);
        }
    }).catch(_ => {
        // tslint:disable-next-line:no-console
        console.log('Downstream System Error: ', _.toString());
        process.exit(0);
    });
