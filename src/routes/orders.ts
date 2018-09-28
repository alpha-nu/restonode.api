import { Router, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Meal } from '../entity/meal';
import { orderProjection } from '../projections/order';
import { Customer } from '../entity/customer';
import { Order } from '../entity/order';

export default (
    mealRepository: Repository<Meal>,
    customerRepository: Repository<Customer>,
    orderRepository: Repository<Order>
) => Router().post('/', async (req: Request, res: Response) => {

    const meals = await mealRepository.findByIds(req.body.mealIds, {relations: ['restaurant']});
    const customer = await customerRepository.findOne({userName: req.body.userName}, {relations: ['address']});

    const result = orderProjection(customer!, meals);
    const order = new Order();
    order.customer = customer!;
    order.meals = meals;
    order.total = result.grandTotal;

    orderRepository.save(order);

    res.status(201).json(result);
});
