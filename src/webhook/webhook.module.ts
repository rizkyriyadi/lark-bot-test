import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { LarkModule } from '../lark/lark.module';
import { ContainersModule } from '../containers/containers.module';

@Module({
    imports: [LarkModule, ContainersModule],
    controllers: [WebhookController],
})
export class WebhookModule { }
