import { Restaurant } from '../entity/restaurant';

export const restaurantProjection = (r: Restaurant) => ({
    name: r.name,
    score: r.ratings.reduce((acc, p) => acc + p.score, 0) / r.ratings.length,
    id: r.id,
    address: r.address.normalized,
});

export const rowRestaurantProjection = (r: any) => ({
    name: r.restaurant_name,
    score: parseFloat(r.avg_rating),
    id: r.restaurant_id,
    address: r.address_normalized,
});

export const restaurantsProjection = (rs: Restaurant[]) => rs.map(_ => rowRestaurantProjection(_));
