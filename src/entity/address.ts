import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Address {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    normalized!: string;
}
