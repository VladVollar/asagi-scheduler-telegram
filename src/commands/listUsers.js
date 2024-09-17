import { getUserInfo } from '../utils/getUserInfo.js';
import { groupIgnoreMiddleware } from '../functions/middleware/groupIgnoreMiddleware.js';
import { registrationMiddleware } from '../functions/middleware/registrationMiddleware.js';
import { adminMiddleware } from '../functions/middleware/adminMiddleware.js';

const setupListUsersCommand = (bot) => {
    bot.command('list_users', groupIgnoreMiddleware, adminMiddleware, registrationMiddleware, async (ctx) => {
        const { users, count } = await getUserInfo();
        const message = `Всего пользователей: ${count}\n\n` + users.map(user => `ID: ${user.id}, Имя: ${user.name}, Юзернейм: @${user.username}`).join('\n');
        ctx.reply(message);
    });
};

export { setupListUsersCommand };