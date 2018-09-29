import { createConnection, getRepository, getConnectionOptions } from 'typeorm';
import { Meal } from '../entity/meal';
import { Restaurant } from '../entity/restaurant';
import { Customer } from '../entity/customer';
import { Address } from '../entity/address';
import * as dotenv from 'dotenv';

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

        // seed users
        const customer1 = new Customer();
        const address1 = new Address();
        address1.normalized = 'Balcarce 476 CABA Argentina';
        customer1.address = address1;
        customer1.canCreateRestaurant = false;
        customer1.userName = 'customer1';
        customer1.firstName = 'first';
        customer1.lastName = 'last';
        customer1.phone = '1111111111';
        await getRepository(Customer).save(customer1);

        const customer2 = new Customer();
        const address2 = new Address();
        address2.normalized = 'Bacacay 4700 caba argentina';
        customer2.address = address2;
        customer2.canCreateRestaurant = false;
        customer2.userName = 'customer2';
        customer2.firstName = 'first';
        customer2.lastName = 'last';
        customer2.phone = '2222222222';
        await getRepository(Customer).save(customer2);

        // seed restaurants
        const address3 = new Address();
        address3.normalized = 'Tucumán 3424, CABA, Argentina';
        const owner1 = new Customer();
        owner1.address = address3;
        owner1.canCreateRestaurant = true;
        owner1.userName = 'owner1';
        owner1.firstName = 'first';
        owner1.lastName = 'last';
        owner1.phone = '3333333333';
        await getRepository(Customer).save(owner1);

        const restaurant1 = new Restaurant();
        const address4 = new Address();
        address4.normalized = 'perú 600, CABA, Argentina';
        restaurant1.address = address4;
        restaurant1.email = 'resto1@email.com';
        restaurant1.name = 'great eats';
        restaurant1.owner = owner1;
        const burger = new Meal();
        burger.name = 'house burger';
        burger.description = 'biggest burger around';
        burger.price = 150;
        const stew = new Meal();
        stew.name = 'winter stew';
        stew.description = 'hearty and delicious';
        stew.price = 240;
        restaurant1.meals = [burger, stew];
        await getRepository(Restaurant).save(restaurant1);

        const restaurant2 = new Restaurant();
        const address5 = new Address();
        address5.normalized = 'arenales 2302, CABA';
        restaurant2.name = 'fancy eats';
        restaurant2.owner = owner1;
        restaurant2.email = 'resto2@email.com';
        restaurant2.address = address5;
        const pizza = new Meal();
        pizza.price = 350;
        pizza.name = 'deep dish pizza';
        pizza.description = 'delicious and greasy';
        restaurant2.meals = [pizza];
        await getRepository(Restaurant).save(restaurant2);

    })
    // tslint:disable-next-line:no-console
    .then(_ => console.log('seed data loaded!'))
    .then(_ => process.exit(0));
