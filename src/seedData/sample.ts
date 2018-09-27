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
        address1.normalized = 'some correct address1';
        customer1.address = address1;
        customer1.canCreateRestaurant = false;
        customer1.userName = 'c1';
        customer1.firstName = 'first1';
        customer1.lastName = 'last1';
        customer1.phone = 1111111111;
        await getRepository(Customer).save(customer1);

        const customer2 = new Customer();
        const address2 = new Address();
        address2.normalized = 'some correct address1';
        customer2.address = address2;
        customer2.canCreateRestaurant = false;
        customer2.userName = 'c2';
        customer2.firstName = 'first2';
        customer2.lastName = 'last2';
        customer2.phone = 1111111111;
        await getRepository(Customer).save(customer2);

        // seed restaurants
        const address3 = new Address();
        address3.normalized = 'address of restaurant 1';
        const owner1 = new Customer();
        owner1.address = address3;
        owner1.canCreateRestaurant = true;
        owner1.userName = 'c2';
        owner1.firstName = 'first2';
        owner1.lastName = 'last2';
        owner1.phone = 1111111111;
        await getRepository(Customer).save(owner1);

        const restaurant1 = new Restaurant();
        const address4 = new Address();
        address4.normalized = 'address of restaurant 1';
        restaurant1.address = address4;
        restaurant1.email = 'resto1@mail.com';
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

    })
    // tslint:disable-next-line:no-console
    .then(_ => console.log('seed data loaded!'))
    .then(_ => process.exit(0));
