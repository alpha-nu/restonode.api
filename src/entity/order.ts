import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Meal } from './meal';
import { Customer } from './customer';

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column('int')
    total!: number;

    @OneToOne(type => Customer, { nullable: false })
    @JoinColumn()
    customer!: Customer;

    @ManyToMany(type => Meal, meal => meal.orders)
    @JoinTable({ name: 'order_meals' })
    meals!: Meal[];
}
