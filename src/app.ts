import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import restaurants from './routes/restaurants';
import orders from './routes/orders';
import { Repository } from 'typeorm';
import { Restaurant } from './entity/restaurant';
import { Customer } from './entity/customer';
import { Rating } from './entity/rating';
import { Meal } from './entity/meal';
import { Order } from './entity/order';
import { globalErrorHandler } from './routes/errorHandlers';

const app = (
    restaurantRepository: Repository<Restaurant>,
    customerRepository: Repository<Customer>,
    ratingRepository: Repository<Rating>,
    mealRepository: Repository<Meal>,
    orderRepository: Repository<Order>
) => {

    const appInstance = express();

    appInstance.use(logger('dev'));
    appInstance.use(express.json());
    appInstance.use(express.urlencoded({ extended: false }));

    appInstance.use('/v1/order-management/restaurants',
        restaurants(restaurantRepository, customerRepository, ratingRepository, mealRepository));
    appInstance.use('/v1/order-management/orders',
        orders(mealRepository, customerRepository, orderRepository));

    appInstance.use(globalErrorHandler);

    return appInstance;
};

export default app;
