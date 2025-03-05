import fs from 'fs';
import {bot} from './botInstance.js';

const filePath = './src/data/users.json';

export const sendMessageToAllUsers = async (message) => {
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const userId of users) {
        try {
            await bot.telegram.sendMessage(userId, message, {parse_mode: 'HTML', disable_web_page_preview: true});
        } catch (error) {
            console.error(`Failed to send message to ${userId}:`, error);
        }
    }
};
