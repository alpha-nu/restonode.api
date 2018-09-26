import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Restaurant } from './restaurant';
import { Order } from './order';

@Entity()
export class Meal {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description: string = '';

    @Column('int')
    price!: number;

    @ManyToOne(type => Restaurant, restaurant => restaurant.meals)
    restaurant!: Restaurant;

    @ManyToMany(type => Order, order => order.meals)
    orders!: Order[];
}
