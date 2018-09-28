import { Meal } from '../entity/meal';
import { Customer } from '../entity/customer';
import { Restaurant } from '../entity/restaurant';

interface IMealGroup {
    restaurant: Restaurant;
    meals: Meal[];
}

export const orderProjection = ({ userName, phone, address }: Customer, orderedMeals: Meal[]) => {

    const mealsGroupedByRestaurant = orderedMeals.reduce((acc: { [index: string]: IMealGroup }, meal: Meal) => {
        acc[meal.restaurant.id] = acc[meal.restaurant.id] || { restaurant: meal.restaurant, meals: [] };
        acc[meal.restaurant.id].meals.push(meal);
        return acc;
    }, {} as { [index: string]: IMealGroup });

    const deliveries = Object.keys(mealsGroupedByRestaurant).map(key => {
        const { restaurant, meals } = mealsGroupedByRestaurant[key];
        return ({
            restaurant: { name: restaurant.name, email: restaurant.email },
            eta: '',
            meals: meals.map(({ name }) => name),
            subTotal: meals.reduce((acc, { price }) => acc + price, 0),
        });
    });

    return (
        {
            deliveries,
            grandTotal: deliveries.reduce((acc, {subTotal}) => acc + subTotal, 0),
            customer: {
                userName,
                phone,
                address: address.normalized,
            },
        }
    );
};
