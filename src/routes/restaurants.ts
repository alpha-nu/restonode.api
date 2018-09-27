import { Request, Response, NextFunction, Router } from 'express';
import { Repository } from 'typeorm';
import { Restaurant } from '../entity/restaurant';
import { restaurantsProjection } from '../projections/restaurant';
import { Customer } from '../entity/customer';
import { Rating } from '../entity/rating';
import { Meal } from '../entity/meal';
import { mealsProjection } from '../projections/meal';

export default (
    restaurantRepository: Repository<Restaurant>,
    customerRepository: Repository<Customer>,
    ratingRepository: Repository<Rating>,
    mealRepository: Repository<Meal>,
) =>
    Router()
        .get('/', async (req: Request, res: Response, next: NextFunction) => {
            const result = await restaurantRepository.find({ relations: ['ratings'] });
            res.json({ restaurants: restaurantsProjection(result) });
        })
        .get('/:id/meals', async (req: Request, res: Response, next: NextFunction) => {
            const result = await mealRepository.find({ restaurant: { id: req.params.id } });
            res.json({ meals: mealsProjection(result) });
        })
        .post('/:id/rate', async (req: Request, res: Response, next: NextFunction) => {
            const restaurant = await restaurantRepository.findOne({ id: req.params.id });
            const customer = await customerRepository.findOne({ userName: req.body.userName });

            const rating = new Rating();
            rating.customer = customer!;
            rating.restaurant = restaurant!;
            rating.score = req.body.rating;

            const savedRating = await ratingRepository.save(rating);

            res.status(201).json({ restaurant: savedRating.restaurant.name, rating: savedRating.score });
        });
