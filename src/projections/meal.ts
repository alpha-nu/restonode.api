import { Meal } from '../entity/meal';

export const mealsProjection = (ms: Meal[]) => {
    return ms.map(({ name, description, price }) => ({ name, description, price }));
};
