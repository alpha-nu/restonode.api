import { Request, Response, Router, RequestHandler, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { Restaurant } from '../entity/restaurant';
import { restaurantsProjection, restaurantProjection } from '../projections/restaurant';
import { Customer } from '../entity/customer';
import { Rating } from '../entity/rating';
import { Meal } from '../entity/meal';
import { mealsProjection, mealProjection } from '../projections/meal';
import { Address } from '../entity/address';
import { safeHandler, RestoNodeError } from './errorHandlers';
import validate from './validation';

export default (
    restaurantRepository: Repository<Restaurant>,
    customerRepository: Repository<Customer>,
    ratingRepository: Repository<Rating>,
    mealRepository: Repository<Meal>
) => {

    const getRestaurantsHandler = async (req: Request, res: Response) => {
        const result = await restaurantRepository.find({ relations: ['ratings', 'address'] });
        res.json({ restaurants: restaurantsProjection(result) });
    };

    const createRestaurantHandler = async (req: Request, res: Response) => {
        const payload = req.body;
        const owner = await customerRepository.findOne({ userName: payload.owner });

        if (owner === undefined) {
            throw new RestoNodeError(404, `did not recognize ${payload.userName}`);
        }

        if (!owner!.canCreateRestaurant) {
            throw new RestoNodeError(401, `${owner!.userName} is not authorized to create a restaurant.`);
        }

        const address = new Address();
        address.normalized = payload.address;
        const restaurant = new Restaurant();
        restaurant.name = payload.name;
        restaurant.owner = owner!;
        restaurant.email = payload.email;
        restaurant.address = address;
        restaurant.ratings = [];

        await validate<Restaurant>(restaurant);

        const savedRestaurant = await restaurantRepository.save(restaurant);
        res.status(201).json(restaurantProjection(savedRestaurant));
    };

    const getMealsHandler = async (req: Request, res: Response) => {
        const result = await mealRepository.find({ restaurant: { id: req.params.id } });

        if (result === undefined || result.length === 0) {
            throw new RestoNodeError(404, 'restaurant not found');
        }

        res.json({ meals: mealsProjection(result) });
    };

    const createMealHandler = async (req: Request, res: Response) => {
        const restaurant = await restaurantRepository.findOne({ id: req.params.id });

        if (restaurant === undefined) {
            throw new RestoNodeError(404, 'restaurant not found');
        }

        const payload = req.body;
        const meal = new Meal();
        meal.restaurant = restaurant!;
        meal.name = payload.name;
        meal.description = payload.description;
        meal.price = payload.price;

        await validate<Meal>(meal);

        const savedMeal = await mealRepository.save(meal);
        res.status(201).json({ meal: mealProjection(savedMeal) });
    };

    const rateRestaurantHandler = async (req: Request, res: Response) => {
        const restaurant = await restaurantRepository.findOne({ id: req.params.id });
        if (restaurant === undefined) {
            throw new RestoNodeError(404, 'restaurant not found');
        }

        const customer = await customerRepository.findOne({ userName: req.body.userName });
        if (customer === undefined) {
            throw new RestoNodeError(404, `did not recognize ${req.body.userName}`);
        }

        const rating = new Rating();
        rating.customer = customer!;
        rating.restaurant = restaurant!;
        rating.score = req.body.rating;

        await validate<Rating>(rating);

        const savedRating = await ratingRepository.save(rating);

        res.status(201).json({ restaurant: savedRating.restaurant.name, rating: savedRating.score });
    };

    return Router()
        .get('/', getRestaurantsHandler)
        .post('/', safeHandler(createRestaurantHandler))
        .get('/:id/meals', safeHandler(getMealsHandler))
        .post('/:id/meals', safeHandler(createMealHandler))
        .post('/:id/rate', safeHandler(rateRestaurantHandler));
};
