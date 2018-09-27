import express from 'express';
import logger from 'morgan';
import restaurants from './routes/restaurants';
import { Repository } from 'typeorm';
import { Restaurant } from './entity/restaurant';
import { Customer } from './entity/customer';
import { Rating } from './entity/rating';

const app = (
    restaurantRepository: Repository<Restaurant>,
    customerRepository: Repository<Customer>,
    ratingRepository: Repository<Rating>,
) => {

    const appInstance = express();

    appInstance.use(logger('dev'));
    appInstance.use(express.json());
    appInstance.use(express.urlencoded({ extended: false }));

    appInstance.use('/v1/order-management/restaurants',
        restaurants(restaurantRepository, customerRepository, ratingRepository));

    return appInstance;
};

export default app;
