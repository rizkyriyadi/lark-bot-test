import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LarkModule } from './lark/lark.module';
import { ContainersModule } from './containers/containers.module';
import { WebhookModule } from './webhook/webhook.module';
import { Container } from './containers/container.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Container],
      synchronize: true,
    }),
    LarkModule,
    ContainersModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
