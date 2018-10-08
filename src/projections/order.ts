import { Meal } from '../entity/meal';
import { Customer } from '../entity/customer';
import { Restaurant } from '../entity/restaurant';

interface IMealGroup {
    restaurant: Restaurant;
    meals: Meal[];
}

interface IMealQuantity {
    id: number;
    quantity: number;
}

export const groupMealsByRestaurant = (orderedMeals: Meal[]): { [index: string]: IMealGroup } => {
    return orderedMeals.reduce((acc: { [index: string]: IMealGroup }, meal: Meal) => {
        acc[meal.restaurant.id] = acc[meal.restaurant.id] || { restaurant: meal.restaurant, meals: [] };
        acc[meal.restaurant.id].meals.push(meal);
        return acc;
    }, {} as { [index: string]: IMealGroup });
};

export const getRestaurantAddresses = (mealsByRestaurant: { [index: string]: IMealGroup }) => {
    return Object.keys(mealsByRestaurant)
        .map(_ => mealsByRestaurant[_].restaurant.address.normalized);
};

export const orderProjection = (
    { userName, phone, address }: Customer,
    groupedMeals: { [index: string]: IMealGroup },
    etas: string[],
    quantities: IMealQuantity[]
) => {

    const mealQuantity = (id: number): IMealQuantity => quantities.find(_ => _.id === id)!;
    const deliveries = Object.keys(groupedMeals).map((key, index) => {
        const { restaurant, meals } = groupedMeals[key];
        return ({
            restaurant: { name: restaurant.name, email: restaurant.email },
            eta: etas[index],
            meals: meals.map(({ name, id }) => ({ name, quantity: mealQuantity(id).quantity })),
            subTotal: meals.reduce((acc, { price, id }) => acc + (price * mealQuantity(id).quantity), 0),
        });
    });

    return (
        {
            deliveries,
            grandTotal: deliveries.reduce((acc, { subTotal }) => acc + subTotal, 0),
            customer: {
                userName,
                phone,
                address: address.normalized,
            },
        }
    );
};
