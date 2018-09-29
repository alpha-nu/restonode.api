import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Meal } from './meal';
import { Customer } from './customer';

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    total!: number;

    @ManyToOne(type => Customer, customer => customer.orders, { nullable: false })
    customer!: Customer;

    @ManyToMany(type => Meal, meal => meal.orders)
    @JoinTable({ name: 'order_meals' })
    meals!: Meal[];
}
