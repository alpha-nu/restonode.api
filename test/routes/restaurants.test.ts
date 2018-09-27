import request from 'supertest';
import app from '../../src/app';
import { mock, when, instance, anything, anyOfClass, reset } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Restaurant } from '../../src/entity/restaurant';
import { Rating } from '../../src/entity/rating';
import { Customer } from '../../src/entity/customer';

describe('/restaurants', () => {

    const mockRestaurantRepository = mock<Repository<Restaurant>>(Repository);
    const mockCustomerRepository = mock<Repository<Customer>>(Repository);
    const mockRatingRepository = mock<Repository<Rating>>(Repository);

    const mockedApp = app(
        instance(mockRestaurantRepository),
        instance(mockCustomerRepository),
        instance(mockRatingRepository),
    );

    afterEach(() => {
        reset(mockRestaurantRepository);
        reset(mockCustomerRepository);
        reset(mockRatingRepository);
    });

    describe('GET /restaurants', () => {
        it('it returns a list of restaurants', async () => {
            const restaurant = new Restaurant();
            restaurant.name = 'Fancy Eats';
            const rating = new Rating();
            rating.score = 100;
            const anotherRating = new Rating();
            anotherRating.score = 50;
            restaurant.ratings = [rating, anotherRating];

            when(mockRestaurantRepository.find(anything())).thenResolve([restaurant]);

            const result = await request(mockedApp).get('/v1/order-management/restaurants');

            expect(result.body.restaurants[0].score).toEqual(75);
        });
    });

    describe('POST /restaurants/:id/rate', () => {
        it('rates a restaurant', async () => {
            const restaurant = new Restaurant();
            restaurant.name = 'fancy eats';
            const customer = new Customer();
            const rating = new Rating();
            rating.restaurant = restaurant;
            rating.score = 7;

            when(mockRestaurantRepository.findOne({id: 1})).thenResolve(restaurant);
            when(mockCustomerRepository.findOne({userName: 'user'})).thenResolve(customer);
            when(mockRatingRepository.save(anyOfClass(Rating))).thenResolve(rating);

            const result = await request(mockedApp)
                .post('/v1/order-management/restaurants/1/rate')
                .send({ userName: 'user', rating: 7 });

            expect(result.status).toBe(201);
            expect(result.body).toEqual({restaurant: 'fancy eats', rating: 7});
        });
    });
});
