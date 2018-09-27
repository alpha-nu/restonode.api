import express from 'express';
import logger from 'morgan';
import restaurants from './routes/restaurants';
import { Repository } from 'typeorm';
import { Restaurant } from './entity/restaurant';
import { Customer } from './entity/customer';
import { Rating } from './entity/rating';
import { Meal } from './entity/meal';

const app = (
    restaurantRepository: Repository<Restaurant>,
    customerRepository: Repository<Customer>,
    ratingRepository: Repository<Rating>,
    mealRepository: Repository<Meal>,
) => {

    const appInstance = express();

    appInstance.use(logger('dev'));
    appInstance.use(express.json());
    appInstance.use(express.urlencoded({ extended: false }));

    appInstance.use('/v1/order-management/restaurants',
        restaurants(restaurantRepository, customerRepository, ratingRepository, mealRepository));

    return appInstance;
};

export default app;
