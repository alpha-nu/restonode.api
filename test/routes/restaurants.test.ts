import request from 'supertest';
import app from '../../src/app';
import { mock, when, verify, instance, anything } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Restaurant } from '../../src/entity/restaurant';
import { Rating } from '../../src/entity/rating';

describe('/restaurants', () => {
    describe('GET', () => {
        it('it returns a list of restaurants', async () => {
            const restaurant = new Restaurant();
            restaurant.name = 'Fancy Eats';
            const rating = new Rating();
            rating.score = 100;
            const anotherRating = new Rating();
            anotherRating.score = 50;
            restaurant.ratings = [rating, anotherRating];

            const mockRepository: Repository<Restaurant> = mock<Repository<Restaurant>>(Repository);
            when(mockRepository.find(anything())).thenReturn(Promise.resolve([restaurant]));

            const result = await request(app(instance(mockRepository))).get('/v1/order-management/restaurants');

            expect(result.body.restaurants[0].score).toEqual(75);
        });
    });
});
