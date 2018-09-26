import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    street!: string;

    @Column()
    city!: string;

    @Column()
    province!: string;

    @Column('int')
    zipCode!: number;
}
