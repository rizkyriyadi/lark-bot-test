import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Container } from './container.entity';
import { LarkService } from './lark.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Container],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Container]),
  ],
  controllers: [AppController],
  providers: [AppService, LarkService],
})
export class AppModule implements OnModuleInit {
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
}
