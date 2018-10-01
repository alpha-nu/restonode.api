import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @IsNotEmpty({message: 'is required'})
    normalized!: string;
}
