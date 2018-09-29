import app from '../../src/app';
import { mock, instance, reset } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Restaurant } from '../../src/entity/restaurant';
import { Rating } from '../../src/entity/rating';
import { Customer } from '../../src/entity/customer';
import { Meal } from '../../src/entity/meal';
import { Order } from '../../src/entity/order';
import { IDistanceMatrixService, DistanceMatrixService } from '../../src/services/distanceMatrix';

export const mockRestaurantRepository = mock<Repository<Restaurant>>(Repository);
export const mockCustomerRepository = mock<Repository<Customer>>(Repository);
export const mockRatingRepository = mock<Repository<Rating>>(Repository);
export const mockMealRepository = mock<Repository<Meal>>(Repository);
export const mockOrderRepository = mock<Repository<Order>>(Repository);
export const mockDistanceMatrixService = mock<IDistanceMatrixService>(DistanceMatrixService);

export const mockedApp = app(
    instance(mockRestaurantRepository),
    instance(mockCustomerRepository),
    instance(mockRatingRepository),
    instance(mockMealRepository),
    instance(mockOrderRepository),
    instance(mockDistanceMatrixService)
);

export const afterEachTest = () => {
    reset(mockRestaurantRepository);
    reset(mockCustomerRepository);
    reset(mockRatingRepository);
    reset(mockMealRepository);
    reset(mockDistanceMatrixService);
};
