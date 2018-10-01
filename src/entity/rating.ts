import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer';
import { Restaurant } from './restaurant';
import { Min, Max, IsNumber, } from 'class-validator';

@Entity()
export class Rating {
    @Column('int')
    @Min(1, { message: `must be >= 1` })
    @Max(10, { message: `must be <= 10` })
    score!: number;

    @ManyToOne(type => Customer, customer => customer.ratings, { primary: true })
    @JoinColumn({ name: 'customerId' })
    customer!: Customer;

    @ManyToOne(type => Restaurant, restaurant => restaurant.ratings, { primary: true })
    @JoinColumn({ name: 'restaurantId' })
    restaurant!: Restaurant;
}
