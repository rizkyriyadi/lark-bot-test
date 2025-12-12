import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Container } from './container.entity';

@Injectable()
export class ContainersService implements OnModuleInit {
    constructor(
        @InjectRepository(Container)
        private containerRepo: Repository<Container>,
    ) { }

    async onModuleInit() {
        console.log('Cleaning database...');
        await this.containerRepo.clear();

        const containers: Container[] = [];
        const statuses = ['GATE_IN', 'ON_HOLD', 'DELIVERED'];

        for (let i = 1; i <= 50; i++) {
            const container = new Container();
            container.container_number = `CNTR-${i.toString().padStart(4, '0')}`;
            container.status = statuses[Math.floor(Math.random() * statuses.length)];
            container.location = `Port Area Zone ${String.fromCharCode(65 + (i % 5))}`; // Zones A-E
            container.last_update = new Date().toISOString();
            containers.push(container);
        }

        await this.containerRepo.save(containers);
        console.log(`Seeding complete: ${containers.length} records inserted.`);
    }

    async search(query: string): Promise<Container[]> {
        return this.containerRepo.find({
            where: [
                { container_number: Like(`%${query}%`) },
                { status: Like(`%${query}%`) },
            ],
            take: 5,
        });
    }
}
