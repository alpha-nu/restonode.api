import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm';
import { Address } from './address';
import { Meal } from './meal';
import { Rating } from './rating';
import { Customer } from './customer';
import { ValidateNested, IsNotEmpty, IsEmail } from 'class-validator';

@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    id!: number;

    @IsNotEmpty({ message: 'is required' })
    @Column()
    name!: string;

    @IsEmail({}, { message: 'must be a valid email' })
    @Column()
    email!: string;

    @ValidateNested()
    @OneToOne(type => Address, { cascade: true })
    @JoinColumn()
    address!: Address;

    @OneToMany(type => Meal, meal => meal.restaurant, { cascade: true })
    meals!: Meal[];

    @OneToMany(type => Rating, rating => rating.restaurant)
    ratings!: Rating[];

    @ManyToOne(type => Customer, customer => customer.restaurant, { cascade: true })
    owner!: Customer;
}
