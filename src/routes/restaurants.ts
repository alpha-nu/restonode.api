import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { Restaurant } from '../entity/restaurant';

export default (repository: Repository<Restaurant>) => async (req: Request, res: Response, next: NextFunction) => {
    const result = (await repository.find({relations: ['ratings']})).map(_ => ({
        name: _.name,
        score: _.ratings.reduce((acc, p) => acc + p.score, 0) / _.ratings.length,
    }));
    res.json({ restaurants: result });
};
