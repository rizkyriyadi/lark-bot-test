import { Controller, Post, Body, Logger } from '@nestjs/common';
import { LarkService } from '../lark/lark.service';
import { ContainersService } from '../containers/containers.service';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(
        private larkService: LarkService,
        private containersService: ContainersService,
    ) { }

    @Post()
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

            try {
                const content = JSON.parse(message.content);
                const text = content.text.trim();
                this.logger.log(`Search query: ${text}`);

                // Search logic
                const results = await this.containersService.search(text);
                this.logger.log(`Found ${results.length} results`);

                if (results.length > 0) {
                    for (const container of results) {
                        await this.larkService.sendCard(chatId, container);
                    }
                } else {
                    // If no results found, or if input was random text like "Halo"
                    // Instead of just saying "Not found", we send the Help/Usage guide.
                    this.logger.log('No results found. Sending Help message.');
                    await this.larkService.sendHelpMessage(chatId);
                }

            } catch (error) {
                this.logger.error('Error processing message', error);
            }
        }

        return { params: {} }; // Acknowledge receipt
    }
}
