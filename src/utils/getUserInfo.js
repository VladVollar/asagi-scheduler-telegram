import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bot } from '../functions/botInstance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUserInfo = async () => {
    const usersPath = path.join(__dirname, '..', 'data', 'users.json');
    const userIds = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    const getUserDetailsById = async (id) => {
        try {
            const user = await bot.telegram.getChat(id);
            return {
                id: user.id,
                name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
                username: user.username || 'N/A'
            };
        } catch (error) {
            return {
                id,
                name: 'Unknown',
                username: 'N/A'
            };
        }
    };

    const userDetailsPromises = userIds.map(id => getUserDetailsById(id));
    const users = await Promise.all(userDetailsPromises);
    return { users, count: users.length };
};
