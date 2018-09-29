import { Router, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Meal } from '../entity/meal';
import { orderProjection, groupMealsByRestaurant, getRestaurantAddresses } from '../projections/order';
import { Customer } from '../entity/customer';
import { Order } from '../entity/order';
import { IDistanceMatrixService } from '../services/distanceMatrix';

export default (
    mealRepository: Repository<Meal>,
    customerRepository: Repository<Customer>,
    orderRepository: Repository<Order>,
    distanceMatrixService: IDistanceMatrixService
) => Router().post('/', async (req: Request, res: Response) => {

    const meals = await mealRepository.findByIds(req.body.mealIds, { relations: ['restaurant', 'restaurant.address'] });
    const customer = await customerRepository.findOne({ userName: req.body.userName }, { relations: ['address'] });

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
});
