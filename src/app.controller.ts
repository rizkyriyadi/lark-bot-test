import { Controller, Post, Body, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Container } from './container.entity';
import { LarkService } from './lark.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectRepository(Container)
    private containerRepo: Repository<Container>,
    private larkService: LarkService,
  ) { }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Received webhook: ${JSON.stringify(body)}`);

    // 1. URL Verification
    if (body.type === 'url_verification') {
      this.logger.log('Handling URL Verification');
      return { challenge: body.challenge };
    }

    // 2. Event Handling
    if (body.header && body.header.event_type === 'im.message.receive_v1') {
      const event = body.event;
      const message = event.message;
      const chatId = message.chat_id;

      // Ignore messages from bot itself to prevent loops (though Lark usually filters this)
      // but strictly speaking, we just reply to user messages.

      try {
        const content = JSON.parse(message.content);
        const text = content.text.trim();
        this.logger.log(`Search query: ${text}`);

        // Search logic
        const results = await this.containerRepo.find({
          where: [
            { container_number: Like(`%${text}%`) },
            { status: Like(`%${text}%`) },
          ],
          take: 5,
        });

        this.logger.log(`Found ${results.length} results`);

        if (results.length === 0) {
          await this.larkService.sendText(chatId, `No containers found for "${text}"`);
        } else {
          for (const container of results) {
            await this.larkService.sendCard(chatId, container);
          }
        }
      } catch (error) {
        this.logger.error('Error processing message', error);
      }
    }

    return { params: {} }; // Acknowledge receipt
  }
}
