import { Meal } from '../entity/meal';

export const mealProjection = ({ name, description, price, id }: Meal) => ({ id, name, description, price });
export const mealsProjection = (ms: Meal[]) => {
    return ms.map(mealProjection);
};
