import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from './container.entity';
import { ContainersService } from './containers.service';

@Module({
    imports: [TypeOrmModule.forFeature([Container])],
    providers: [ContainersService],
    exports: [ContainersService],
})
export class ContainersModule { }
