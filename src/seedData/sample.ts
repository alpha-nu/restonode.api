import { createConnection, getRepository, getConnectionOptions } from 'typeorm';
import { Meal } from '../entity/meal';
import { Restaurant } from '../entity/restaurant';
import { Customer } from '../entity/customer';
import { Address } from '../entity/address';
import * as dotenv from 'dotenv';
import { Rating } from '../entity/rating';

dotenv.config();

const loadTypeOrmOptions = async () => await getConnectionOptions();

loadTypeOrmOptions()
    .then(async _ => {

        const localOptions = {
            database: process.env.DATABASE,
            username: process.env.DB_USER_NAME,
            password: process.env.DB_USER_PASSWORD,
        };

        return await createConnection(Object.assign(localOptions, _));
    })
    .then(async (c) => {

        // drop and recreate schema
        await c.synchronize(true);

        const addresses = [
            'Tucumán 3424, CABA, Argentina',
            'perú 600, CABA, Argentina',
            'arenales 2302, CABA ,Argentina',
            'Armenia 1641, CABA',
            'Av. del Libertador 1902, Buenos Aires',
            'Las Casas 4095, CABA',
            '1549, Av. Carabobo, Flores, Buenos Aires',
            'Olavarría 1601, CABA',
            'Libertad 431, CABA',
            'Av. Federico Lacroze 3779, CABA',
        ];

        // tslint:disable-next-line:max-line-length
        const descriptionLorem = 'Duis eu sapien sodales, gravida sapien ac, maximus orci. Curabitur sollicitudin turpis diam, nec tincidunt nulla elementum auctor. In a arcu sed dolor porttitor egestas in placerat tortor. Nunc vehicula ipsum in lorem posuere vulputate. Morbi turpis duis';

        const ratingGenerator = () => Math.floor(Math.random() * 10) + 1;

        // seed users
        const customer1 = new Customer();
        const address1 = new Address();
        address1.normalized = 'Balcarce 476 CABA Argentina';
        customer1.address = address1;
        customer1.canCreateRestaurant = false;
        customer1.userName = 'hungryJoe';
        customer1.firstName = 'hungry';
        customer1.lastName = 'joe';
        customer1.phone = '1111111111';
        await getRepository(Customer).save(customer1);

        const customer2 = new Customer();
        const address2 = new Address();
        address2.normalized = 'Bacacay 4700 caba argentina';
        customer2.address = address2;
        customer2.canCreateRestaurant = false;
        customer2.userName = 'greedyPete';
        customer2.firstName = 'greedy';
        customer2.lastName = 'pete';
        customer2.phone = '2222222222';
        await getRepository(Customer).save(customer2);

        // seed restaurants
        const owner1 = new Customer();
        const address3 = new Address();
        address3.normalized = 'Av. Díaz Vélez 5044, CABA';
        owner1.address = address3;
        owner1.canCreateRestaurant = true;
        owner1.userName = 'mrBigShot';
        owner1.firstName = 'big';
        owner1.lastName = 'shot';
        owner1.phone = '3333333333';
        await getRepository(Customer).save(owner1);

        // addresses.forEach(async (normalizedAddress, index) => {
        for (let i = 0; i < addresses.length; i++) {
            const restaurantName = `resto - ${i}`;
            const restaurant = new Restaurant();
            const address = new Address();
            address.normalized = addresses[i];
            restaurant.address = address;
            restaurant.email = `${restaurantName}@email.com`;
            restaurant.name = restaurantName;
            restaurant.owner = owner1;
            const meals = [];
            for (let j = 0; j <= Math.floor(Math.random() * 5) + 5; j++) {
                const meal = new Meal();
                meal.name = `Meal - ${i} - ${j}`;
                meal.description = descriptionLorem.substr(0, Math.floor(Math.random() * 155) + 100);
                meal.price = Math.random() * 1000 + 200;
                meals.push(meal);
            }
            restaurant.meals = meals;
            await getRepository(Restaurant).save(restaurant);
            const savedRestaurant = await getRepository(Restaurant).findOne({name: restaurantName});
            const rating = new Rating();
            rating.customer = customer1;
            rating.score = ratingGenerator();
            rating.restaurant = savedRestaurant!;
            await getRepository(Rating).save(rating);
        }
    })
    // tslint:disable-next-line:no-console
    .then(_ => console.log('seed data loaded!'))
    .then(_ => process.exit(0));
