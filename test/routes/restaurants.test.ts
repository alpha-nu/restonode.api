import request from 'supertest';
import { when, anything, deepEqual, verify } from 'ts-mockito';
import { Restaurant } from '../../src/entity/restaurant';
import { Rating } from '../../src/entity/rating';
import { Customer } from '../../src/entity/customer';
import { Meal } from '../../src/entity/meal';
import {
    mockRestaurantRepository,
    mockedApp,
    mockCustomerRepository,
    mockRatingRepository,
    mockMealRepository,
    afterEachTest,
} from './setup';

describe('/restaurants', () => {

    afterEach(() => afterEachTest());

    describe('GET /restaurants', () => {
        it('it returns a list of restaurants', async () => {
            const restaurant = new Restaurant();
            restaurant.name = 'Fancy Eats';
            restaurant.id = 1;
            const rating = new Rating();
            rating.score = 100;
            const anotherRating = new Rating();
            anotherRating.score = 50;
            restaurant.ratings = [rating, anotherRating];

            when(mockRestaurantRepository.find(deepEqual({ relations: ['ratings'] }))).thenResolve([restaurant]);

            const result = await request(mockedApp).get('/v1/order-management/restaurants');

            expect(result.body.restaurants).toEqual([{ score: 75, name: 'Fancy Eats', id: 1 }]);
        });
    });

    describe('POST /restaurants/:id/rate', () => {
        it('rates a restaurant', async () => {
            const customer = new Customer();
            customer.userName = 'user';
            const restaurant = new Restaurant();
            restaurant.name = 'fancy eats';
            const rating = new Rating();
            rating.restaurant = restaurant;
            rating.customer = customer;
            rating.score = 7;

            when(mockRestaurantRepository.findOne(deepEqual({id: '1'}))).thenResolve(restaurant);
            when(mockCustomerRepository.findOne(deepEqual({userName: 'user'}))).thenResolve(customer);
            when(mockRatingRepository.save(deepEqual(rating))).thenResolve(rating);

            const result = await request(mockedApp)
                .post('/v1/order-management/restaurants/1/rate')
                .send({ userName: 'user', rating: 7 });

            expect(result.status).toBe(201);
            expect(result.body).toEqual({ restaurant: 'fancy eats', rating: 7 });
            verify(mockCustomerRepository.findOne(deepEqual({userName: 'user'}))).called();
            verify(mockRestaurantRepository.findOne(deepEqual({id: '1'}))).called();
        });
    });

    describe('GET /restaurants/:id/meals', () => {
        it('returns a list of all meals offered by a restaurant', async () => {
            const burger = new Meal();
            burger.name = 'awesome burger';
            burger.id = 1;
            burger.description = 'holy grail of burger-dom';
            burger.price = 150;

            when(mockMealRepository.find(anything())).thenResolve([burger]);
            const result = await request(mockedApp).get('/v1/order-management/restaurants/1/meals');

            expect(result.status).toBe(200);
            expect(result.body).toEqual({
                meals: [{
                    id: 1,
                    name: 'awesome burger',
                    description: 'holy grail of burger-dom',
                    price: 150,
                }],
            });
        });
    });
});
