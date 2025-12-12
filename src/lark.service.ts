import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LarkService {
    private readonly logger = new Logger(LarkService.name);
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    async getTenantAccessToken(): Promise<string> {
        const now = Date.now();
        if (this.accessToken && now < this.tokenExpiry) {
            return this.accessToken;
        }

        this.logger.log('Fetching new Tenant Access Token...');
        const appId = process.env.LARK_APP_ID;
        const appSecret = process.env.LARK_APP_SECRET;

        if (!appId || !appSecret) {
            this.logger.error('LARK_APP_ID or LARK_APP_SECRET not set!');
            throw new Error('Missing Lark Credentials');
        }

        try {
            const response = await axios.post(
                'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal',
                {
                    app_id: appId,
                    app_secret: appSecret,
                },
            );

            if (response.data.code !== 0) {
                throw new Error(`Auth Error: ${response.data.msg}`);
            }

            this.accessToken = response.data.tenant_access_token;
            // expire in 2 hours (approx), subtract 5 mins for safety
            this.tokenExpiry = now + (response.data.expire * 1000) - 300000;
            this.logger.log('Token fetched successfully.');
            return this.accessToken!;
        } catch (error) {
            this.logger.error('Failed to fetch token', error);
            throw error;
        }
    }

    async sendCard(chatId: string, container: any) {
        const token = await this.getTenantAccessToken();
        const url = `https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id`;

        const statusEmoji = container.status === 'DELIVERED' ? '✅' : '⚠️';

        const cardContent = {
            config: {
                wide_screen_mode: true,
            },
            header: {
                template: 'blue',
                title: {
                    content: '📦 Container Status',
                    tag: 'plain_text',
                },
            },
            elements: [
                {
                    tag: 'div',
                    fields: [
                        {
                            is_short: true,
                            text: {
                                tag: 'lark_md',
                                content: `**Container Number:**\n${container.container_number}`,
                            },
                        },
                        {
                            is_short: true,
                            text: {
                                tag: 'lark_md',
                                content: `**Status:**\n${statusEmoji} ${container.status}`,
                            },
                        },
                    ],
                },
                {
                    tag: 'div',
                    fields: [
                        {
                            is_short: false,
                            text: {
                                tag: 'lark_md',
                                content: `**Location:** ${container.location}\n**Last Update:** ${container.last_update}`,
                            },
                        },
                    ],
                },
            ],
        };

        try {
            await axios.post(
                url,
                {
                    receive_id: chatId,
                    msg_type: 'interactive',
                    content: JSON.stringify(cardContent),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            this.logger.log(`Reply sent to ${chatId}`);
        } catch (error) {
            this.logger.error('Failed to send message', error);
        }
    }

    async sendText(chatId: string, text: string) {
        const token = await this.getTenantAccessToken();
        const url = `https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id`;

        try {
            await axios.post(
                url,
                {
                    receive_id: chatId,
                    msg_type: 'text',
                    content: JSON.stringify({ text }),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            this.logger.log(`Text reply sent to ${chatId}`);
        } catch (error) {
            this.logger.error('Failed to send text message', error);
        }
    }
}
