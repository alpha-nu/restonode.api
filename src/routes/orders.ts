import { Router, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Meal } from '../entity/meal';
import { orderProjection, groupMealsByRestaurant, getRestaurantAddresses } from '../projections/order';
import { Customer } from '../entity/customer';
import { Order } from '../entity/order';
import { IDistanceMatrixService } from '../services/distanceMatrix';
import { RestoNodeError, safeHandler } from './errorHandlers';

export default (
    mealRepository: Repository<Meal>,
    customerRepository: Repository<Customer>,
    orderRepository: Repository<Order>,
    distanceMatrixService: IDistanceMatrixService
) => {
    const createOrderHandler = async (req: Request, res: Response) => {
        const meals = await mealRepository.findByIds(req.body.mealIds,
            {
                relations: ['restaurant', 'restaurant.address'],
            });
        if (meals.length === 0) {
            throw new RestoNodeError(400, 'order must include at least one meal');
        }

        const customer = await customerRepository.findOne({ userName: req.body.userName }, { relations: ['address'] });
        if (customer === undefined) {
            throw new RestoNodeError(404, `did not recognize ${req.body.userName}`);
        }

        const mealsByRestaurant = groupMealsByRestaurant(meals);
        const restaurantAddresses = getRestaurantAddresses(mealsByRestaurant);

        const etas = await distanceMatrixService.getETAs(restaurantAddresses, customer!.address.normalized);

        const result = orderProjection(customer!, mealsByRestaurant, etas);
        const order = new Order();
        order.customer = customer!;
        order.meals = meals;
        order.total = result.grandTotal;

        orderRepository.save(order);

        res.status(201).json(result);
    };

    return Router().post('/', safeHandler(createOrderHandler));
};
