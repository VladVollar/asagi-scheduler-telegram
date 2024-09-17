import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, '..', '..', 'data', 'users.json');

const reloadRegisteredUsers = () => {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
};

const isRegistered = (ctx) => {
    const userId = ctx.message ? ctx.message.from.id : ctx.callbackQuery.from.id;
    const registeredUsers = reloadRegisteredUsers();
    return registeredUsers.includes(userId);
};

export { isRegistered };