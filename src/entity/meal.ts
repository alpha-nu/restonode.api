import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Restaurant } from './restaurant';
import { Order } from './order';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Entity()
export class Meal {

    @PrimaryGeneratedColumn()
    id!: number;

    @IsNotEmpty({ message: 'is required' })
    @Column()
    name!: string;

    @IsNotEmpty({ message: 'is required' })
    @Column()
    description!: string;

    @Column('int')
    @IsNumber({ allowNaN: false }, { message: 'must be a number' })
    @IsNotEmpty({ message: 'is required' })
    price!: number;

    @ManyToOne(type => Restaurant, restaurant => restaurant.meals, { nullable: false })
    restaurant!: Restaurant;

    @ManyToMany(type => Order, order => order.meals)
    orders!: Order[];
}
