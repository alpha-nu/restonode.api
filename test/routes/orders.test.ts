import request from 'supertest';
import {
    mockedApp,
    mockCustomerRepository,
    mockMealRepository,
    mockOrderRepository,
    afterEachTest,
    mockDistanceMatrixService,
} from './setup';
import { Meal } from '../../src/entity/meal';
import { when, deepEqual, verify, anyOfClass } from 'ts-mockito';
import { Restaurant } from '../../src/entity/restaurant';
import { Customer } from '../../src/entity/customer';
import { Address } from '../../src/entity/address';
import { Order } from '../../src/entity/order';

describe('/orders', () => {

    afterEach(() => afterEachTest());

    describe('POST /orders', () => {
        it('creates an order', async () => {

            setupHungryJoeOrder();

            const result = await request(mockedApp).post('/v1/order-management/orders')
                .send({
                    userName: 'hungryJoe',
                    mealIds: [1, 2, 3],
                });

            verify(mockOrderRepository.save(anyOfClass(Order))).once();
            expect(result.status).toBe(201);
            expect(result.body).toEqual({
                deliveries: [
                    {
                        restaurant: { name: 'restaurant1', email: 'r1@email.com' },
                        eta: '40 mins',
                        meals: ['meal1', 'meal2'],
                        subTotal: 145,
                    },
                    {
                        restaurant: { name: 'restaurant2', email: 'r2@email.com' },
                        eta: '27 mins',
                        meals: ['meal3'],
                        subTotal: 70,
                    },
                ],
                grandTotal: 215,
                customer: {
                    userName: 'hungryJoe',
                    phone: '1111111111',
                    address: 'joe\'s address',
                },
            });
        });
    });
});

const setupHungryJoeOrder = () => {
    const restaurant1 = new Restaurant();
    restaurant1.name = 'restaurant1';
    restaurant1.email = 'r1@email.com';
    restaurant1.id = 1;
    const address1 = new Address();
    address1.normalized = 'address of restaurant1';
    restaurant1.address = address1;
    const restaurant2 = new Restaurant();
    restaurant2.name = 'restaurant2';
    restaurant2.email = 'r2@email.com';
    restaurant2.id = 2;
    const address2 = new Address();
    address2.normalized = 'address of restaurant2';
    restaurant2.address = address2;
    const meal1 = new Meal();
    meal1.price = 100;
    meal1.name = 'meal1';
    meal1.restaurant = restaurant1;
    const meal2 = new Meal();
    meal2.price = 45;
    meal2.name = 'meal2';
    meal2.restaurant = restaurant1;
    const meal3 = new Meal();
    meal3.price = 70;
    meal3.name = 'meal3';
    meal3.restaurant = restaurant2;
    const customer = new Customer();
    customer.userName = 'hungryJoe';
    customer.phone = '1111111111';
    const joesAddress = new Address();
    joesAddress.normalized = 'joe\'s address';
    customer.address = joesAddress;

    when(mockMealRepository.findByIds(
        deepEqual([1, 2, 3]),
        deepEqual({ relations: ['restaurant', 'restaurant.address'] })
    )).thenResolve([meal1, meal2, meal3]);
    when(mockCustomerRepository.findOne(
        deepEqual({ userName: 'hungryJoe' }),
        deepEqual({ relations: ['address'] })
    )).thenResolve(customer);
    when(mockDistanceMatrixService.getETAs(
        deepEqual(['address of restaurant1', 'address of restaurant2']),
        'joe\'s address'
    )).thenResolve(['40 mins', '27 mins']);
};
