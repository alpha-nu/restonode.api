import { Meal } from '../entity/meal';

export const mealsProjection = (ms: Meal[]) => {
    return ms.map(({ name, description, price, id }) => ({ id, name, description, price }));
};
