import express from 'express';
import logger from 'morgan';
import restaurants from './routes/restaurants';
import { Repository } from 'typeorm';
import { Restaurant } from './entity/restaurant';

const app = (restaurantRepository: Repository<Restaurant>) => {

    const appInstance = express();

    appInstance.use(logger('dev'));
    appInstance.use(express.json());
    appInstance.use(express.urlencoded({ extended: false }));
    const router = express.Router();

    router.use('/restaurants', restaurants(restaurantRepository));

    appInstance.use('/v1/order-management', router);

    return appInstance;
};

export default app;
