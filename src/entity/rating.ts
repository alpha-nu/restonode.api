import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer';
import { Restaurant } from './restaurant';

@Entity()
export class Rating {

    @Column('int')
    score!: number;

    @ManyToOne(type => Customer, customer => customer.ratings, { primary: true })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @ManyToOne(type => Restaurant, restaurant => restaurant.ratings, { primary: true })
    @JoinColumn({ name: 'restaurantId' })
    restaurant!: Restaurant;
}
