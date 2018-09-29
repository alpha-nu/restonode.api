import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Address } from './address';
import { Rating } from './rating';
import { Restaurant } from './restaurant';
import { Order } from './order';

@Entity()
export class Customer {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userName!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    phone!: string;

    @Column()
    canCreateRestaurant: boolean = false;

    @OneToMany(type => Restaurant, restaurant => restaurant.owner)
    restaurant?: Restaurant[];

    @OneToOne(type => Address, { cascade: true })
    @JoinColumn()
    address!: Address;

    @OneToOne(type => Rating, rating => rating.customer)
    ratings!: Rating[];

    @OneToMany(type => Order, order => order.customer)
    orders!: Order[];
}
