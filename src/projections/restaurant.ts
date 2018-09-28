import { Restaurant } from '../entity/restaurant';

export const restaurantProjection = (r: Restaurant) => ({
    name: r.name,
    score: r.ratings.reduce((acc, p) => acc + p.score, 0) / r.ratings.length,
    id: r.id,
});

export const restaurantsProjection = (rs: Restaurant[]) => rs.map(_ => restaurantProjection(_));
