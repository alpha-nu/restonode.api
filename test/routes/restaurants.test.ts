import request from 'supertest';
import { when, anything, deepEqual, verify, mock } from 'ts-mockito';
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
import { Address } from '../../src/entity/address';

describe('/restaurants', () => {

    afterEach(() => afterEachTest());

    describe('GET /restaurants', () => {
        it('returns a list of restaurants', async () => {

            const mockInnerJoinAndSelect = jest.fn().mockReturnThis();
            const mockLeftJoinAndSelect = jest.fn().mockReturnThis();
            const mockAddSelect = jest.fn().mockReturnThis();
            const mockGroupBy = jest.fn().mockReturnThis();
            const mockHaving = jest.fn().mockReturnThis();
            const mockOrderBy = jest.fn().mockReturnThis();
            when(mockRestaurantRepository.createQueryBuilder('restaurant'))
                .thenReturn({
                    innerJoinAndSelect: mockInnerJoinAndSelect,
                    leftJoinAndSelect: mockLeftJoinAndSelect,
                    addSelect: mockAddSelect,
                    groupBy: mockGroupBy,
                    having: mockHaving,
                    orderBy: mockOrderBy,
                    getRawMany: jest.fn().mockResolvedValue([{
                        restaurant_id: 1,
                        restaurant_name: 'Fancy Eats',
                        address_normalized: 'address',
                        avg_rating: '8.0000',
                    }]),
                } as any);

            const result = await request(mockedApp).get('/v1/order-management/restaurants').query({ rating: '5' });

            expect(result.body.restaurants).toEqual([{ score: 8, name: 'Fancy Eats', id: 1, address: 'address' }]);
            expect(mockInnerJoinAndSelect).toHaveBeenCalledWith('restaurant.address', 'address');
            expect(mockLeftJoinAndSelect).toHaveBeenCalledWith('restaurant.ratings', 'rating');
            expect(mockAddSelect).toHaveBeenCalledWith('AVG(rating.score)', 'avg_rating');
            expect(mockGroupBy).toHaveBeenCalledWith('restaurant.id');
            expect(mockHaving).toHaveBeenCalledWith('avg_rating >= :rating', { rating: '5' });
            expect(mockOrderBy).toHaveBeenCalledWith('avg_rating', 'DESC');
        });

        it('returns 400 if rating filter value is NaN', async () => {
            const result = await request(mockedApp)
                .get('/v1/order-management/restaurants')
                .query({ rating: 'moo' });

            expect(result.status).toBe(400);
            expect(result.body.message).toBe('rating filter must be an integer');
        });
    });

    describe('POST /restaurants', () => {
        it('creates a restaurant', async () => {
            const owner = new Customer();
            owner.userName = 'userName';
            owner.canCreateRestaurant = true;
            const address = new Address();
            address.normalized = 'address';
            const restaurant = new Restaurant();
            restaurant.owner = owner;
            restaurant.email = 'awesome@email.com';
            restaurant.name = 'awesome restaurant';
            restaurant.address = address;
            restaurant.ratings = [];

            when(mockCustomerRepository.findOne(deepEqual({ userName: 'userName' }))).thenResolve(owner);
            when(mockRestaurantRepository.save(deepEqual(restaurant))).thenResolve(restaurant);

            const result = await request(mockedApp).post('/v1/order-management/restaurants')
                .send({
                    owner: 'userName',
                    address: 'address',
                    name: 'awesome restaurant',
                    email: 'awesome@email.com',
                });

            expect(result.status).toBe(201);
            // tslint:disable-next-line:no-null-keyword
            expect(result.body).toEqual({ name: 'awesome restaurant', score: null, address: 'address' });
        });

        it('return 404 is user is not found', async () => {
            when(mockCustomerRepository.findOne(anything())).thenResolve(undefined);

            const result = await request(mockedApp).post('/v1/order-management/restaurants').send({
                userName: 'imposter',
            });

            expect(result.status).toBe(404);
            expect(result.body.message).toEqual(`did not recognize imposter`);
        });

        it('returns 401 is user has no owner permissions', async () => {
            const unauthorizedUser = new Customer();
            unauthorizedUser.userName = 'imposter';
            when(mockCustomerRepository.findOne(anything())).thenResolve(unauthorizedUser);

            const result = await request(mockedApp).post('/v1/order-management/restaurants')
                .send({ owner: 'imposter' });

            expect(result.status).toBe(401);
            expect(result.body.message).toBe('imposter is not authorized to create a restaurant.');
        });

        it('returns 400 is required information is missing', async () => {
            const customer = new Customer();
            customer.canCreateRestaurant = true;
            when(mockCustomerRepository.findOne(anything())).thenResolve(customer);

            const result = await request(mockedApp).post('/v1/order-management/restaurants')
                .send({
                    owner: '',
                    address: '',
                    name: '',
                    email: 'invalid email',
                });

            expect(result.status).toBe(400);
            expect(result.body.message)
                .toContainEqual({
                    children: [{ children: [], constraints: { isNotEmpty: 'is required' }, property: 'normalized' }],
                    property: 'address',
                });
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { isEmail: 'must be a valid email' }, property: 'email' });
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { isNotEmpty: 'is required' }, property: 'name' });
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

            when(mockRestaurantRepository.findOne(deepEqual({ id: '1' }))).thenResolve(restaurant);
            when(mockCustomerRepository.findOne(deepEqual({ userName: 'user' }))).thenResolve(customer);
            when(mockRatingRepository.save(deepEqual(rating))).thenResolve(rating);

            const result = await request(mockedApp)
                .post('/v1/order-management/restaurants/1/rate')
                .send({ userName: 'user', rating: 7 });

            expect(result.status).toBe(201);
            expect(result.body).toEqual({ restaurant: 'fancy eats', rating: 7 });
            verify(mockCustomerRepository.findOne(deepEqual({ userName: 'user' }))).called();
            verify(mockRestaurantRepository.findOne(deepEqual({ id: '1' }))).called();
        });

        it('return 404 is user is not found', async () => {
            when(mockRestaurantRepository.findOne(anything())).thenResolve(mock(Restaurant));
            when(mockCustomerRepository.findOne(anything())).thenResolve(undefined);

            const result = await request(mockedApp).post('/v1/order-management/restaurants').send({
                userName: 'imposter',
            });

            expect(result.status).toBe(404);
            expect(result.body.message).toEqual(`did not recognize imposter`);
        });

        it('returns 404 if restaurant is not found', async () => {
            when(mockRestaurantRepository.findOne(anything())).thenResolve(undefined);

            const result = await request(mockedApp).post('/v1/order-management/restaurants/999/rate').send();

            expect(result.status).toBe(404);
            expect(result.body.message).toBe('restaurant not found');
        });

        it('returns 400 if rating score is outside of 1 - 10', async () => {
            when(mockRestaurantRepository.findOne(anything())).thenResolve(mock(Restaurant));
            when(mockCustomerRepository.findOne(anything())).thenResolve(mock(Customer));
            let result = await request(mockedApp).post('/v1/order-management/restaurants/1/rate')
                .send({ rating: 20 });

            expect(result.status).toBe(400);
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { max: 'must be <= 10' }, property: 'score' });

            result = await request(mockedApp).post('/v1/order-management/restaurants/1/rate')
                .send({ rating: 0 });

            expect(result.status).toBe(400);
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { min: 'must be >= 1' }, property: 'score' });
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

    describe('POST /restaurants/:id/meals', () => {
        it('adds a meal to a restaurant menu', async () => {
            const restaurant = new Restaurant();
            const meal = new Meal();
            meal.name = 'yummy';
            meal.description = 'so fatty';
            meal.price = 100;
            meal.restaurant = restaurant;
            when(mockRestaurantRepository.findOne(deepEqual({ id: '1' }))).thenResolve(restaurant);
            when(mockMealRepository.save(deepEqual(meal))).thenResolve(meal);

            const result = await request(mockedApp).post('/v1/order-management/restaurants/1/meals')
                .send({
                    name: 'yummy',
                    description: 'so fatty',
                    price: 100,
                });

            expect(result.status).toBe(201);
            expect(result.body.meal).toEqual({
                name: 'yummy',
                description: 'so fatty',
                price: 100,
            });
        });

        it('returns 404 if restaurant is not found', async () => {
            when(mockRestaurantRepository.findOne(anything())).thenResolve(undefined);

            const result = await request(mockedApp).post('/v1/order-management/restaurants/1/meals').send();

            expect(result.status).toBe(404);
            expect(result.body.message).toBe('restaurant not found');
        });

        it('returns 400 if required meal information is missing', async () => {
            when(mockRestaurantRepository.findOne(anything())).thenResolve(mock(Restaurant));

            const result = await request(mockedApp).post('/v1/order-management/restaurants/1/meals').send();

            expect(result.status).toBe(400);
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { isNotEmpty: 'is required' }, property: 'name' });
            expect(result.body.message)
                .toContainEqual({ children: [], constraints: { isNotEmpty: 'is required' }, property: 'description' });
            expect(result.body.message)
                .toContainEqual({
                    children: [],
                    constraints: { isNotEmpty: 'is required', isNumber: 'must be a number' },
                    property: 'price',
                });
        });
    });
});
