import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Container {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    container_number: string;

    @Column()
    status: string; // GATE_IN, ON_HOLD, DELIVERED

    @Column()
    location: string;

    @Column()
    last_update: string;
}
